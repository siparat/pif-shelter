import { Command } from '@nestjs/cqrs';

export class SetUserProfileCommand extends Command<{
	userId: string;
	email: string;
	position: string;
	telegram: string;
}> {
	constructor(
		public readonly userId: string,
		public readonly email: string,
		public readonly position: string,
		public readonly telegram: string
	) {
		super();
	}
}
