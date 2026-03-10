import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LinkTelegramResult } from '@pif/contracts';
import {
	AnimalStatusEnum,
	GUARDIANSHIP_BOT_LINK_PREFIX,
	GuardianshipBotCallback,
	GuardianshipBotCommands,
	MY_ANIMALS_BOT_PAGE_SIZE
} from '@pif/shared';
import { StorageService } from '@pif/storage';
import { Logger } from 'nestjs-pino';
import { Command, Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Telegraf, TelegramError } from 'telegraf';
import { CancelGuardianshipAsGuardianCommand } from '../guardianship/commands/cancel-guardianship-as-guardian/cancel-guardianship-as-guardian.command';
import { GetAnimalForGuardianCardQuery } from '../guardianship/queries/get-animal-for-guardian-card/get-animal-for-guardian-card.query';
import { GetMyGaurdianshipsQuery } from '../guardianship/queries/get-my-guardianships/get-my-guardianships.query';
import { UsersService } from '../users/users.service';
import { LinkTelegramByTokenCommand } from './commands/link-telegram-by-token/link-telegram-by-token.command';
import { sendAccountNotLinkedMessage, sendNoGuardianshipsMessage } from './messages/exceptions.message';
import { sendHelpMessage } from './messages/help.message';
import { sendMyAnimalCardMessage } from './messages/my-animal-card.message';
import { buildMyAnimalsListContent, sendMyAnimalsListMessage } from './messages/my-animals-list.message';
import { sendShelterPhotoMessage } from './messages/shelter-photo.message';
import { sendStartLinkAlreadyUsedMessage } from './messages/start-link-already-used.message';
import { sendStartLinkMismatchMessage } from './messages/start-link-mismatch.message';
import { sendStartLinkSuccessMessage } from './messages/start-link-success.message';
import { sendTelegramUsernameIsNotExistsMessage } from './messages/telegram-username-is-not-exists.message';
import {
	sendUnsubscribeAbortedMessage,
	sendUnsubscribeConfirmMessage,
	sendUnsubscribeListMessage,
	sendUnsubscribeSuccessMessage
} from './messages/unsubscribe.message';
import { BotHelpConfigRepository } from './repositories/bot-help-config.repository';
import type { BotContext } from './telegram-bot.context';

@Update()
export class TelegramBotUpdate implements OnModuleInit {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly botHelpConfigRepository: BotHelpConfigRepository,
		private readonly usersService: UsersService,
		private readonly storage: StorageService,
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
	async onStart(@Ctx() ctx: BotContext): Promise<void> {
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
	async onHelp(@Ctx() ctx: BotContext): Promise<void> {
		const helpContent = await this.botHelpConfigRepository.getHelpContent();
		await sendHelpMessage(ctx, helpContent);
		await this.setCommands();
	}

	@Command(GuardianshipBotCommands.MY_ANIMALS.command)
	async onMyAnimals(@Ctx() ctx: BotContext): Promise<void> {
		const chatId = ctx.chat?.id;
		if (!chatId) return;
		const user = await this.usersService.findByTelegramChatId(String(chatId));
		if (!user) {
			return sendAccountNotLinkedMessage(ctx);
		}
		const { guardianships } = await this.queryBus.execute(new GetMyGaurdianshipsQuery(user.id));
		if (!guardianships?.length) {
			return sendNoGuardianshipsMessage(ctx);
		}
		const totalPages = Math.ceil(guardianships.length / MY_ANIMALS_BOT_PAGE_SIZE) || 1;
		await sendMyAnimalsListMessage(ctx, {
			guardianships,
			page: 1,
			perPage: MY_ANIMALS_BOT_PAGE_SIZE,
			totalPages
		});
	}

	@Command(GuardianshipBotCommands.UNSUBSCRIBE.command)
	async onUnsubscribe(@Ctx() ctx: BotContext): Promise<void> {
		const chatId = ctx.chat?.id;
		if (!chatId) return;

		const user = await this.usersService.findByTelegramChatId(String(chatId));
		if (!user) {
			return sendAccountNotLinkedMessage(ctx);
		}
		const { guardianships } = await this.queryBus.execute(new GetMyGaurdianshipsQuery(user.id));
		if (!guardianships?.length) {
			return sendNoGuardianshipsMessage(ctx);
		}
		const list = guardianships.map((g) => ({
			guardianshipId: g.id,
			animalName: g.animal?.name ?? '—'
		}));
		ctx.session.unsubscribe = { guardianships: list };
		await sendUnsubscribeListMessage(ctx, { list });
	}

	@On('callback_query')
	async onCallbackQuery(@Ctx() ctx: BotContext): Promise<void> {
		const chatId = ctx.chat?.id;
		const data = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;
		if (!chatId || typeof data !== 'string') return;

		if (data === GuardianshipBotCallback.UNSCRIBE.ABORT) {
			return this.unscribeAbort(ctx);
		}

		if (data.startsWith(GuardianshipBotCallback.UNSCRIBE.CONFIRM_PREFIX)) {
			return this.unscribeConfirm(ctx, data, chatId);
		}

		if (data.startsWith(GuardianshipBotCallback.UNSCRIBE.CHOICE_PREFIX)) {
			return this.unscribeChoice(ctx, data);
		}

		if (data.startsWith(GuardianshipBotCallback.MY_ANIMALS.LIST_PAGE_PREFIX)) {
			return this.myAnimalsListPage(ctx, data, chatId);
		}

		if (data.startsWith(GuardianshipBotCallback.MY_ANIMALS.CARD_PREFIX)) {
			return this.myAnimalsCard(ctx, data, chatId);
		}
	}

	private async myAnimalsListPage(ctx: BotContext, data: string, chatId: number): Promise<void> {
		const pageStr = data.slice(GuardianshipBotCallback.MY_ANIMALS.LIST_PAGE_PREFIX.length);
		const page = Number(pageStr);
		if (Number.isNaN(page) || page < 1) {
			await ctx.answerCbQuery();
			return;
		}
		const user = await this.usersService.findByTelegramChatId(String(chatId));
		if (!user) {
			await ctx.answerCbQuery('Пользователь не найден');
			return;
		}
		const { guardianships } = await this.queryBus.execute(new GetMyGaurdianshipsQuery(user.id));
		if (!guardianships?.length) {
			await ctx.answerCbQuery('Список пуст');
			return;
		}
		const totalPages = Math.ceil(guardianships.length / MY_ANIMALS_BOT_PAGE_SIZE) || 1;
		const safePage = Math.min(page, totalPages);
		const content = buildMyAnimalsListContent({
			guardianships,
			page: safePage,
			perPage: MY_ANIMALS_BOT_PAGE_SIZE,
			totalPages
		});
		await ctx.editMessageText(content.text, content.keyboard);
		await ctx.answerCbQuery();
		return;
	}

	private async myAnimalsCard(ctx: BotContext, data: string, chatId: number): Promise<void> {
		const animalId = data.slice(GuardianshipBotCallback.MY_ANIMALS.CARD_PREFIX.length);
		const user = await this.usersService.findByTelegramChatId(String(chatId));
		if (!user) {
			await ctx.answerCbQuery('Пользователь не найден');
			return;
		}
		try {
			const { animal, curator } = await this.queryBus.execute(
				new GetAnimalForGuardianCardQuery(animalId, user.id)
			);
			let avatarPhotoUrl: string | undefined;
			if (
				animal.status === AnimalStatusEnum.PUBLISHED &&
				animal.avatarUrl &&
				typeof animal.avatarUrl === 'string'
			) {
				avatarPhotoUrl = await this.storage.getSignedUrl(animal.avatarUrl);
			}
			await ctx.answerCbQuery();
			await sendMyAnimalCardMessage(ctx, {
				animal,
				curator,
				avatarPhotoUrl
			});
		} catch {
			await ctx.answerCbQuery('Не удалось загрузить карточку. Попробуйте позже.');
		}
	}

	private async unscribeChoice(ctx: BotContext, data: string): Promise<void> {
		const guardianshipId = data.slice(GuardianshipBotCallback.UNSCRIBE.CHOICE_PREFIX.length);
		const unsubscribe = ctx.session?.unsubscribe;
		const guardianship = unsubscribe?.guardianships.find((g) => g.guardianshipId === guardianshipId);
		if (!unsubscribe || !guardianship) {
			await ctx.answerCbQuery('Сессия истекла. Начните заново: /unsubscribe');
			return;
		}
		ctx.session ??= {};
		ctx.session.unsubscribe = { ...unsubscribe, selected: guardianship };
		await ctx.answerCbQuery();
		await sendUnsubscribeConfirmMessage(ctx, { animalName: guardianship.animalName }, guardianshipId);
		return;
	}

	private async unscribeConfirm(ctx: BotContext, data: string, chatId: number): Promise<void> {
		const guardianshipId = data.slice(GuardianshipBotCallback.UNSCRIBE.CONFIRM_PREFIX.length);
		const selected = ctx.session?.unsubscribe?.selected;
		if (!selected || selected.guardianshipId !== guardianshipId) {
			await ctx.answerCbQuery('Сессия истекла. Начните заново: /unsubscribe');
			return;
		}
		const user = await this.usersService.findByTelegramChatId(String(chatId));
		if (!user) {
			await ctx.answerCbQuery('Пользователь не найден');
			return;
		}
		try {
			await this.commandBus.execute(new CancelGuardianshipAsGuardianCommand(guardianshipId, user.id));
			if (ctx.session?.unsubscribe) ctx.session.unsubscribe = undefined;
			await ctx.answerCbQuery();
			await sendUnsubscribeSuccessMessage(ctx, { animalName: selected.animalName });
			this.logger.log('Опекун отменил опекунство через бота', {
				guardianshipId,
				guardianUserId: user.id,
				chatId: String(chatId)
			});
		} catch (err) {
			this.logger.warn('Ошибка отмены опекунства через бота', {
				err: err instanceof Error ? err.message : err,
				guardianshipId,
				chatId: String(chatId)
			});
			await ctx.answerCbQuery('Не удалось отменить. Попробуйте позже или напишите в приют.');
		}
		return;
	}

	private async unscribeAbort(ctx: BotContext): Promise<void> {
		if (ctx.session?.unsubscribe) ctx.session.unsubscribe = undefined;
		await ctx.answerCbQuery();
		return await sendUnsubscribeAbortedMessage(ctx);
	}

	private async handleStartWithToken(token: string, ctx: BotContext): Promise<void> {
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
