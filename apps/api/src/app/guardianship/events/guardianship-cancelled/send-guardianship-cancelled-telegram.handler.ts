import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DatabaseService } from '@pif/database';
import { Logger } from 'nestjs-pino';
import { TelegramBotService } from '../../../telegram-bot/telegram-bot.service';
import { GuardianshipCancelledEvent } from './guardianship-cancelled.event';
import { GuardianshipStatusEnum } from '@pif/shared';

@EventsHandler(GuardianshipCancelledEvent)
export class SendGuardianshipCancelledTelegramHandler implements IEventHandler<GuardianshipCancelledEvent> {
	constructor(
		private readonly db: DatabaseService,
		private readonly telegramBotService: TelegramBotService,
		private readonly logger: Logger
	) {}

	async handle(event: GuardianshipCancelledEvent): Promise<void> {
		const guardianship = await this.db.client.query.guardianships.findFirst({
			where: { id: event.guardianship.id },
			with: { animal: true, guardian: true }
		});
		if (!guardianship?.guardian || !guardianship?.animal?.name) {
			this.logger.debug('Пропуск Telegram об отмене опекунства: нет данных', {
				guardianshipId: event.guardianship.id
			});
			return;
		}
		if (event.guardianship.status !== GuardianshipStatusEnum.ACTIVE) {
			this.logger.debug('Пропуск отправки письма со ссылкой отмены: подписка не была ранее активна', {
				guardianUserId: event.guardianship.guardianUserId
			});
			return;
		}
		const chatId = guardianship.guardian.telegramChatId;
		if (chatId == null) {
			this.logger.debug('Пропуск Telegram об отмене опекунства: у опекуна не привязан Telegram', {
				guardianshipId: event.guardianship.id
			});
			return;
		}

		try {
			await this.telegramBotService.sendGuardianshipCancelledMessage(Number(chatId), {
				animalName: guardianship.animal.name,
				reason: event.reason ?? 'Животное сняли с опекунства',
				isRefundExpected: event.isRefundExpected
			});
			this.logger.log('Уведомление в Telegram об отмене опекунства отправлено', {
				guardianshipId: event.guardianship.id,
				guardianUserId: guardianship.guardian.id
			});
		} catch (error) {
			this.logger.error('Ошибка при отправке уведомления в Telegram об отмене опекунства', {
				err: error instanceof Error ? error.message : error,
				guardianshipId: event.guardianship.id,
				guardianUserId: guardianship.guardian.id
			});
		}
	}
}
