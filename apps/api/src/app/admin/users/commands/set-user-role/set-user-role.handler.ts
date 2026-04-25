import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRole } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { UsersService } from '../../../../users/users.service';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { SetUserRoleCommand } from './set-user-role.command';

const ALLOWED_TEAM_ROLES = [UserRole.VOLUNTEER, UserRole.SENIOR_VOLUNTEER, UserRole.ADMIN];

@CommandHandler(SetUserRoleCommand)
export class SetUserRoleHandler implements ICommandHandler<SetUserRoleCommand> {
	constructor(
		private readonly usersService: UsersService,
		private readonly logger: Logger
	) {}

	async execute(command: SetUserRoleCommand): Promise<{ userId: string; roleName: UserRole }> {
		const { userId, roleName, actorUserId } = command;

		if (!ALLOWED_TEAM_ROLES.includes(roleName)) {
			throw new BadRequestException('Недопустимая роль для участника команды');
		}
		if (userId === actorUserId) {
			throw new BadRequestException('Нельзя менять собственную роль');
		}

		const user = await this.usersService.findById(userId);
		if (!user) {
			throw new UserNotFoundException(userId);
		}
		if (!ALLOWED_TEAM_ROLES.includes(user.role)) {
			throw new ForbiddenException('Изменение роли доступно только участникам команды');
		}
		if (user.role === roleName) {
			return { userId, roleName };
		}

		await this.usersService.setRole(userId, roleName);
		this.logger.log('role обновлён', { userId, roleName, actorUserId });
		return { userId, roleName };
	}
}
