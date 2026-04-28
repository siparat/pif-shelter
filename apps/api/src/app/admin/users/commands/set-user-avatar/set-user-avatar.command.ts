import { Command } from '@nestjs/cqrs';

export class SetUserAvatarCommand extends Command<{ userId: string; avatarKey: string }> {
	constructor(
		public readonly userId: string,
		public readonly avatarKey: string
	) {
		super();
	}
}
