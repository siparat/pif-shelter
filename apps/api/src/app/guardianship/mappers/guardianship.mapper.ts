import { guardianships } from '@pif/database';
import { GuardianshipStatusEnum } from '@pif/shared';
import { InferInsertModel } from 'drizzle-orm';

type GuardianshipInsertModel = InferInsertModel<typeof guardianships>;

export class GuardianshipMapper {
	static fromCreateDTO(
		userId: string,
		animalId: string,
		subscriptionId: string,
		monthlyAmount: number
	): GuardianshipInsertModel {
		return {
			animalId,
			guardianUserId: userId,
			monthlyAmount,
			subscriptionId,
			status: GuardianshipStatusEnum.PENDING_PAYMENT
		};
	}
}
