import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { ISendGuardianshipCancelledPayload } from './interfaces/send-guardianship-cancelled-payload.interface';
import { buildGuardianshipCancelledMessage } from './messages/guardianship-cancelled.message';

@Injectable()
export class TelegramBotService {
	constructor(
		@InjectBot() private readonly bot: Telegraf,
		private readonly config: ConfigService
	) {}

	async sendGuardianshipCancelledMessage(chatId: number, payload: ISendGuardianshipCancelledPayload): Promise<void> {
		const adminUsername = this.config.getOrThrow<string>('TELEGRAM_ADMIN_USERNAME');
		const { text, markup } = buildGuardianshipCancelledMessage({
			...payload,
			adminTelegramUsername: adminUsername
		});

		await this.bot.telegram.sendMessage(chatId, text, {
			link_preview_options: { is_disabled: true },
			...(markup ?? {})
		});
	}
}
