import { Injectable } from '@nestjs/common';
import { DatabaseService, guardianshipPortalAccessWhere, guardianships } from '@pif/database';
import { PostVisibilityEnum, UserRole } from '@pif/shared';
import { NotGuardianException } from '../exceptions/not-guardian.exception';

export type PostViewContext = { visibility: PostVisibilityEnum; animalId: string };

@Injectable()
export class CanViewPostPolicy {
	constructor(private readonly db: DatabaseService) {}

	async assertCanView(post: PostViewContext, userId: string | null, userRole: UserRole | null): Promise<void> {
		if (post.visibility === PostVisibilityEnum.PUBLIC) {
			return;
		}
		if (!userId || !userRole) {
			throw new NotGuardianException();
		}
		if (userRole === UserRole.VOLUNTEER || userRole === UserRole.SENIOR_VOLUNTEER || userRole === UserRole.ADMIN) {
			return;
		}
		const [guardianship] = await this.db.client
			.select({ id: guardianships.id })
			.from(guardianships)
			.where(
				guardianshipPortalAccessWhere(new Date(), {
					animalId: post.animalId,
					guardianUserId: userId
				})
			)
			.limit(1);
		if (!guardianship) {
			throw new NotGuardianException();
		}
	}
}
