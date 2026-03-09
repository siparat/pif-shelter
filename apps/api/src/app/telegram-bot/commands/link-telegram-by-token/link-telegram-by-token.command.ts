import { Command } from '@nestjs/cqrs';
import { LinkTelegramResult } from '@pif/contracts';

export class LinkTelegramByTokenCommand extends Command<{ result: LinkTelegramResult }> {
	constructor(
		public readonly token: string,
		public readonly chatId: string,
		public readonly telegramUsername: string
	) {
		super();
	}
}
