import { guardianships } from '@pif/database';
import { GuardianshipStatusEnum } from '@pif/shared';
import { InferInsertModel } from 'drizzle-orm';

type GuardianshipInsertModel = InferInsertModel<typeof guardianships>;

export class GuardianshipMapper {
	static fromCreateDTO(userId: string, animalId: string, subscriptionId: string): GuardianshipInsertModel {
		return {
			animalId,
			guardianUserId: userId,
			subscriptionId,
			status: GuardianshipStatusEnum.PENDING_PAYMENT
		};
	}
}
