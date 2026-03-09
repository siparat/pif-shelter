import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LinkTelegramResult } from '@pif/contracts';
import { GUARDIANSHIP_BOT_LINK_PREFIX, GuardianshipBotCommands } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { Command, Ctx, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf, TelegramError } from 'telegraf';
import { GetMyGaurdianshipsQuery } from '../guardianship/queries/get-my-guardianships/get-my-guardianships.query';
import { UsersService } from '../users/users.service';
import { LinkTelegramByTokenCommand } from './commands/link-telegram-by-token/link-telegram-by-token.command';
import { sendHelpMessage } from './messages/help.message';
import { sendShelterPhotoMessage } from './messages/shelter-photo.message';
import { sendStartLinkAlreadyUsedMessage } from './messages/start-link-already-used.message';
import { sendStartLinkMismatchMessage } from './messages/start-link-mismatch.message';
import { sendStartLinkSuccessMessage } from './messages/start-link-success.message';
import { sendTelegramUsernameIsNotExistsMessage } from './messages/telegram-username-is-not-exists.message';
import { BotHelpConfigRepository } from './repositories/bot-help-config.repository';

@Update()
export class TelegramBotUpdate implements OnModuleInit {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly botHelpConfigRepository: BotHelpConfigRepository,
		private readonly usersService: UsersService,
		private readonly logger: Logger,
		private readonly config: ConfigService,
		@InjectBot() private readonly telegraf: Telegraf
	) {}

	onModuleInit(): void {
		this.telegraf.catch((err: unknown) => this.handleTelegrafError(err).catch((e) => this.logger.error(e)));
		process.on('unhandledRejection', (reason: unknown) => {
			if (reason instanceof TelegramError) {
				this.handleTelegrafError(reason);
			}
		});
	}

	@Start()
	async onStart(@Ctx() ctx: Context): Promise<void> {
		if (
			'startPayload' in ctx &&
			typeof ctx.startPayload === 'string' &&
			ctx.startPayload.startsWith(GUARDIANSHIP_BOT_LINK_PREFIX)
		) {
			return this.handleStartWithToken(ctx.startPayload.slice(GUARDIANSHIP_BOT_LINK_PREFIX.length), ctx);
		}
		await this.setCommands();
		return sendShelterPhotoMessage(ctx);
	}

	@Command(GuardianshipBotCommands.HELP.command)
	async onHelp(@Ctx() ctx: Context): Promise<void> {
		const helpContent = await this.botHelpConfigRepository.getHelpContent();
		await sendHelpMessage(ctx, helpContent);
		await this.setCommands();
	}

	@Command(GuardianshipBotCommands.MY_ANIMALS.command)
	async onMyAnimals(@Ctx() ctx: Context): Promise<void> {
		const chatId = ctx.chat?.id;
		if (!chatId) return;
		const user = await this.usersService.findByTelegramChatId(String(chatId));
		if (!user) {
			await ctx.reply('❗Сначала привяжите аккаунт по ссылке из письма после оформления опекунства');
			return;
		}
		const { guardianships } = await this.queryBus.execute(new GetMyGaurdianshipsQuery(user.id));
		if (!guardianships?.length) {
			await ctx.reply('⚠️ У вас пока нет активных опекунств');
			return;
		}
		const lines = guardianships.map((g) => `• ${g.animal?.name ?? '—'}`);
		await ctx.reply(`Ваши подопечные:\n${lines.join('\n')}`);
	}

	private async handleStartWithToken(token: string, ctx: Context): Promise<void> {
		const chatId = ctx.chat?.id;
		const telegramUsername = ctx.from?.username;
		if (!chatId || !telegramUsername) {
			return sendTelegramUsernameIsNotExistsMessage(ctx);
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

	private async setCommands(): Promise<void> {
		this.telegraf.telegram.setMyCommands(Object.values(GuardianshipBotCommands));
	}

	private async handleTelegrafError(err: unknown): Promise<void> {
		try {
			if (!(err instanceof TelegramError)) {
				this.logger.error(err);
				return;
			}
			if (err.response.error_code !== 403) {
				this.logger.error(err);
				return;
			}
			if (
				'payload' in err.on &&
				err.on.payload &&
				typeof err.on.payload === 'object' &&
				'chat_id' in err.on.payload
			) {
				const chatId = String(err.on.payload.chat_id);
				const user = await this.usersService.findByTelegramChatId(chatId);
				if (user) {
					await this.usersService.setTelegramUnreachable(user.id, true);
					this.logger.warn('Пользователь помечен как telegram_unreachable после 403', {
						user,
						chatId
					});
				}
			}
		} catch (e) {
			this.logger.error(e);
		}
	}
}
