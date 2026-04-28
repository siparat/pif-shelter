import { ForbiddenException, Injectable } from '@nestjs/common';
import { users } from '@pif/database';
import { UserRole } from '@pif/shared';
import { FileStoragePolicy } from '../../../../core/policies/file-storage.policy';
import { UsersService } from '../../../../users/users.service';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';

const ALLOWED_TEAM_ROLES = [UserRole.VOLUNTEER, UserRole.SENIOR_VOLUNTEER, UserRole.ADMIN];

@Injectable()
export class SetUserAvatarPolicy {
	constructor(
		private readonly usersService: UsersService,
		private readonly fileStoragePolicy: FileStoragePolicy
	) {}

	async assertCanSet(userId: string, avatarKey: string): Promise<typeof users.$inferSelect> {
		const user = await this.usersService.findById(userId);
		if (!user) {
			throw new UserNotFoundException(userId);
		}
		if (!ALLOWED_TEAM_ROLES.includes(user.role)) {
			throw new ForbiddenException('Установка аватарки доступна только участникам команды');
		}
		await this.fileStoragePolicy.assertExists(avatarKey);
		return user;
	}
}
