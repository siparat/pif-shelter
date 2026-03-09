import { Command } from '@nestjs/cqrs';

export class SetTelegramUnreachableCommand extends Command<{ userId: string; telegramUnreachable: boolean }> {
	constructor(
		public readonly userId: string,
		public readonly unreachable: boolean
	) {
		super();
	}
}
