import { Guardianship, guardianships } from '@pif/database';

export abstract class GuardianshipRepository {
	abstract findById(id: string): Promise<typeof guardianships.$inferSelect | undefined>;
	abstract findActiveOrPendingByAnimalId(id: string): Promise<typeof guardianships.$inferSelect | undefined>;
	abstract createPending(
		userId: string,
		animalId: string,
		subscriptionId: string,
		monthlyAmount: number
	): Promise<Guardianship>;
	abstract activate(id: string): Promise<void>;
	abstract cancel(id: string, cancelledAt: Date): Promise<void>;
}
