import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { UsersService } from '../../../../users/users.service';
import { SetUserProfileCommand } from './set-user-profile.command';
import { SetUserProfilePolicy } from './set-user-profile.policy';

@CommandHandler(SetUserProfileCommand)
export class SetUserProfileHandler implements ICommandHandler<SetUserProfileCommand> {
	constructor(
		private readonly usersService: UsersService,
		private readonly logger: Logger,
		private readonly policy: SetUserProfilePolicy
	) {}

	async execute(
		command: SetUserProfileCommand
	): Promise<{ userId: string; email: string; position: string; telegram: string }> {
		const { userId, email, position, telegram } = command;
		const normalizedEmail = email.trim().toLowerCase();
		const normalizedPosition = position.trim();

		const user = await this.policy.assertCanSet(userId, normalizedEmail, telegram);

		if (user.email === normalizedEmail && user.position === normalizedPosition && user.telegram === telegram) {
			return {
				userId,
				email: normalizedEmail,
				position: normalizedPosition,
				telegram
			};
		}

		await this.usersService.setProfile(userId, normalizedEmail, normalizedPosition, telegram);

		this.logger.log('user profile обновлён', {
			userId,
			email: normalizedEmail,
			position: normalizedPosition,
			telegram
		});

		return {
			userId,
			email: normalizedEmail,
			position: normalizedPosition,
			telegram
		};
	}
}
