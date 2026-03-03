import { Guardianship, guardianships } from '@pif/database';

export abstract class GuardianshipRepository {
	abstract findById(id: string): Promise<typeof guardianships.$inferSelect | undefined>;
	abstract findBySubscriptionId(subscriptionId: string): Promise<typeof guardianships.$inferSelect | undefined>;
	abstract findByCancellationToken(token: string): Promise<typeof guardianships.$inferSelect | undefined>;
	abstract findActiveOrPendingByAnimalId(id: string): Promise<typeof guardianships.$inferSelect | undefined>;
	abstract createPending(userId: string, animalId: string, subscriptionId: string): Promise<Guardianship>;
	abstract activate(id: string): Promise<void>;
	abstract cancel(id: string, cancelledAt: Date): Promise<void>;
}
