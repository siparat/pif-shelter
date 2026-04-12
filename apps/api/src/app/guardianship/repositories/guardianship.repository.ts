import { Guardianship, guardianships } from '@pif/database';

export type GuardianshipLedgerLabels = {
	animalName: string;
	guardianDisplayName: string | null;
};

export abstract class GuardianshipRepository {
	abstract findById(id: string): Promise<typeof guardianships.$inferSelect | undefined>;
	abstract findBySubscriptionId(subscriptionId: string): Promise<typeof guardianships.$inferSelect | undefined>;
	abstract findLedgerLabelsByGuardianshipId(id: string): Promise<GuardianshipLedgerLabels | undefined>;
	abstract findByCancellationToken(token: string): Promise<typeof guardianships.$inferSelect | undefined>;
	abstract findActiveOrPendingByAnimalId(id: string): Promise<typeof guardianships.$inferSelect | undefined>;
	abstract createPending(userId: string, animalId: string, subscriptionId: string): Promise<Guardianship>;
	abstract activate(id: string): Promise<void>;
	abstract activateWithPaidPeriodEnd(id: string, paidPeriodEndAt: Date): Promise<void>;
	abstract updatePaidPeriodEnd(id: string, paidPeriodEndAt: Date): Promise<void>;
	abstract cancel(id: string, cancelledAt: Date, guardianPrivilegesUntil: Date | null): Promise<void>;
	abstract setTelegramReminderSentAt(id: string, at: Date): Promise<void>;
}
