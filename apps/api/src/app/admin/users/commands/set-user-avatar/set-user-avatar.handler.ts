import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { UsersService } from '../../../../users/users.service';
import { SetUserAvatarCommand } from './set-user-avatar.command';
import { SetUserAvatarPolicy } from './set-user-avatar.policy';

@CommandHandler(SetUserAvatarCommand)
export class SetUserAvatarHandler implements ICommandHandler<SetUserAvatarCommand> {
	constructor(
		private readonly usersService: UsersService,
		private readonly logger: Logger,
		private readonly policy: SetUserAvatarPolicy
	) {}

	async execute(command: SetUserAvatarCommand): Promise<{ userId: string; avatarKey: string }> {
		const { userId, avatarKey } = command;

		const user = await this.policy.assertCanSet(userId, avatarKey);

		if (user.image === avatarKey) {
			return { userId, avatarKey };
		}

		await this.usersService.setAvatar(userId, avatarKey);

		this.logger.log('avatar обновлён', { userId, avatarKey });

		return { userId, avatarKey };
	}
}
