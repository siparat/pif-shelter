import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@pif/database';
import { GuardianshipStatusEnum, PostVisibilityEnum, UserRole } from '@pif/shared';

export type PostViewContext = { visibility: PostVisibilityEnum; animalId: string };

@Injectable()
export class CanViewPostPolicy {
	constructor(private readonly db: DatabaseService) {}

	async assertCanView(post: PostViewContext, userId: string | null, userRole: UserRole | null): Promise<void> {
		if (post.visibility === PostVisibilityEnum.PUBLIC) {
			return;
		}
		if (!userId || !userRole) {
			throw new ForbiddenException('Приватный пост доступен только авторизованным опекунам или сотрудникам');
		}
		if (userRole === UserRole.VOLUNTEER || userRole === UserRole.SENIOR_VOLUNTEER || userRole === UserRole.ADMIN) {
			return;
		}
		const guardianship = await this.db.client.query.guardianships.findFirst({
			where: {
				animalId: post.animalId,
				guardianUserId: userId,
				status: GuardianshipStatusEnum.ACTIVE
			}
		});
		if (!guardianship) {
			throw new ForbiddenException('Приватный пост доступен только опекунам этого животного или сотрудникам');
		}
	}
}
