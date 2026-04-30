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
	): Promise<{ userId: string; name: string; email: string; position: string; telegram: string }> {
		const { userId, name, email, position, telegram } = command;
		const normalizedName = name.trim();
		const normalizedEmail = email.trim().toLowerCase();
		const normalizedPosition = position.trim();

		const user = await this.policy.assertCanSet(userId, normalizedEmail, telegram);

		if (
			user.name === normalizedName &&
			user.email === normalizedEmail &&
			user.position === normalizedPosition &&
			user.telegram === telegram
		) {
			return {
				userId,
				name: normalizedName,
				email: normalizedEmail,
				position: normalizedPosition,
				telegram
			};
		}

		await this.usersService.setProfile(userId, normalizedName, normalizedEmail, normalizedPosition, telegram);

		this.logger.log('user profile обновлён', {
			userId,
			name: normalizedName,
			email: normalizedEmail,
			position: normalizedPosition,
			telegram
		});

		return {
			userId,
			name: normalizedName,
			email: normalizedEmail,
			position: normalizedPosition,
			telegram
		};
	}
}
