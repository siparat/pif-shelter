import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LinkTelegramResult } from '@pif/contracts';
import { botHelpConfig, DatabaseService } from '@pif/database';
import { GUARDIANSHIP_BOT_LINK_PREFIX } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Context, TelegramError } from 'telegraf';
import { GetMyGaurdianshipsQuery } from '../guardianship/queries/get-my-guardianships/get-my-guardianships.query';
import { UsersService } from '../users/users.service';
import { LinkTelegramByTokenCommand } from './commands/link-telegram-by-token/link-telegram-by-token.command';
import { sendStartLinkMismatchMessage } from './messages/start-link-mismatch.message';
import { sendStartLinkAlreadyUsedMessage } from './messages/start-link-already-used.message';
import { sendStartLinkSuccessMessage } from './messages/start-link-success.message';
import { sendTelegramUsernameIsNotExistsMessage } from './messages/telegram-username-is-not-exists.message';

@Update()
export class TelegramBotUpdate {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly db: DatabaseService,
		private readonly usersService: UsersService,
		private readonly logger: Logger,
		private readonly config: ConfigService
	) {}

	@Start()
	async onStart(@Ctx() ctx: Context): Promise<void> {
		const chatId = ctx.chat?.id;

		if (
			'startPayload' in ctx &&
			typeof ctx.startPayload === 'string' &&
			ctx.startPayload.startsWith(GUARDIANSHIP_BOT_LINK_PREFIX)
		) {
			return this.handleStartWithToken(ctx.startPayload.slice(GUARDIANSHIP_BOT_LINK_PREFIX.length), ctx);
		}

		const userIdByChat = chatId ? await this.usersService.findByTelegramChatId(String(chatId)) : null;
		if (userIdByChat) {
			await this.safeReply(ctx, 'Вы уже привязаны. Команды: /my_animals — список подопечных, /help — справка.');
			return;
		}

		await this.safeReply(
			ctx,
			'Привет! Это бот приюта ПИФ. Для привязки аккаунта перейдите по ссылке из письма после оформления опекунства.'
		);
	}

	@Command('help')
	async onHelp(@Ctx() ctx: Context): Promise<void> {
		const all = await this.db.client.select().from(botHelpConfig);
		const order = ['help_contacts', 'help_address', 'help_visiting_rules', 'help_site_url'];
		const parts: string[] = [];
		for (const key of order) {
			const row = all.find((r) => r.key === key);
			if (row?.value) parts.push(row.value);
		}
		const text = parts.length > 0 ? parts.join('\n\n') : 'Справка пока не заполнена. Напишите в приют.';
		await this.safeReply(ctx, text);
	}

	@Command('my_animals')
	async onMyAnimals(@Ctx() ctx: Context): Promise<void> {
		const chatId = ctx.chat?.id;
		if (!chatId) return;
		const user = await this.usersService.findByTelegramChatId(String(chatId));
		if (!user) {
			await this.safeReply(ctx, 'Сначала привяжите аккаунт по ссылке из письма после оформления опекунства.');
			return;
		}
		const { guardianships } = await this.queryBus.execute(new GetMyGaurdianshipsQuery(user.id));
		if (!guardianships?.length) {
			await this.safeReply(ctx, 'У вас пока нет активных опекунств.');
			return;
		}
		const lines = guardianships.map((g) => `• ${g.animal?.name ?? '—'}`);
		await this.safeReply(ctx, `Ваши подопечные:\n${lines.join('\n')}`);
	}

	private async handleStartWithToken(token: string, ctx: Context): Promise<void> {
		const chatId = ctx.chat?.id;
		const telegramUsername = ctx.from?.username;
		if (!chatId || !telegramUsername) {
			return sendTelegramUsernameIsNotExistsMessage(ctx)
		}

		const { result } = await this.commandBus.execute(
			new LinkTelegramByTokenCommand(token, String(chatId), telegramUsername)
		);
		switch (result) {
			case LinkTelegramResult.SUCCESS: {
				return sendStartLinkSuccessMessage(ctx);
			}
			case LinkTelegramResult.ALREADY_USED: {
				return sendStartLinkAlreadyUsedMessage(ctx);
			}
			case LinkTelegramResult.USERNAME_MISMATCH: {
				const adminUsername = this.config.getOrThrow<string>('TELEGRAM_ADMIN_USERNAME');
				return sendStartLinkMismatchMessage(ctx, { adminUsername });
			}
		}
	}

	private async safeReply(ctx: Context, text: string): Promise<void> {
		try {
			await ctx.reply(text);
		} catch (err) {
			if (!(err instanceof TelegramError)) {
				throw err;
			}
			const code = err.response.error_code;
			if (code !== 403 || !ctx.chat?.id) {
				throw err;
			}
			const chatIdStr = String(ctx.chat.id);
			const user = await this.usersService.findByTelegramChatId(chatIdStr);
			if (user) {
				await this.usersService.setTelegramUnreachable(user.id, true);
				this.logger.warn('Пользователь помечен как telegram_unreachable после 403', {
					userId: user.id,
					chatId: chatIdStr
				});
			}
		}
	}
}
