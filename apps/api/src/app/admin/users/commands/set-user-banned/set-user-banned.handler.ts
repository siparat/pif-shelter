import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { UserRole } from '@pif/shared';
import { UsersService } from '../../../../users/users.service';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { SetUserBannedCommand } from './set-user-banned.command';

@CommandHandler(SetUserBannedCommand)
export class SetUserBannedHandler implements ICommandHandler<SetUserBannedCommand> {
	constructor(
		private readonly usersService: UsersService,
		private readonly logger: Logger
	) {}

	async execute(command: SetUserBannedCommand): Promise<{ userId: string; banned: boolean }> {
		const { userId, banned, actorUserId, actorRole } = command;
		if (userId === actorUserId) {
			throw new BadRequestException('Нельзя заблокировать собственный аккаунт');
		}
		const user = await this.usersService.findById(userId);
		if (!user) {
			throw new UserNotFoundException(userId);
		}
		if (user.role === UserRole.ADMIN && actorRole !== UserRole.ADMIN) {
			throw new ForbiddenException('Только администратор может блокировать других администраторов');
		}
		if (user.banned === banned) {
			return { userId, banned };
		}
		await this.usersService.setBanned(userId, banned);
		this.logger.log('banned обновлён', { userId, banned, actorUserId });
		return { userId, banned };
	}
}
