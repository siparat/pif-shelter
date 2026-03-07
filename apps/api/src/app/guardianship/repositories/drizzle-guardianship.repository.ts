import { Injectable } from '@nestjs/common';
import { DatabaseService, Guardianship, guardianships } from '@pif/database';
import { GuardianshipStatusEnum } from '@pif/shared';
import { eq } from 'drizzle-orm';
import { AnimalAlreadyHasGuardianException } from '../exceptions/animal-already-has-guardian.exception';
import { GuardianshipMapper } from '../mappers/guardianship.mapper';
import { GuardianshipRepository } from './guardianship.repository';

@Injectable()
export class DrizzleGuardianshipRepository implements GuardianshipRepository {
	constructor(private readonly db: DatabaseService) {}

	findById(id: string): Promise<typeof guardianships.$inferSelect | undefined> {
		return this.db.client.query.guardianships.findFirst({
			where: { id }
		});
	}

	findBySubscriptionId(subscriptionId: string): Promise<typeof guardianships.$inferSelect | undefined> {
		return this.db.client.query.guardianships.findFirst({
			where: { subscriptionId }
		});
	}

	findByCancellationToken(token: string): Promise<typeof guardianships.$inferSelect | undefined> {
		return this.db.client.query.guardianships.findFirst({
			where: { cancellationToken: token }
		});
	}

	findActiveOrPendingByAnimalId(id: string): Promise<typeof guardianships.$inferSelect | undefined> {
		return this.db.client.query.guardianships.findFirst({
			where: {
				animalId: id,
				status: { in: [GuardianshipStatusEnum.ACTIVE, GuardianshipStatusEnum.PENDING_PAYMENT] }
			}
		});
	}

	async createPending(userId: string, animalId: string, subscriptionId: string): Promise<Guardianship> {
		const values = GuardianshipMapper.fromCreateDTO(userId, animalId, subscriptionId);
		try {
			const [guardianship] = await this.db.client.insert(guardianships).values(values).returning();
			return guardianship;
		} catch (e) {
			const code = e != null && typeof e === 'object' && 'code' in e ? e.code : undefined;
			if (code === '23505') {
				throw new AnimalAlreadyHasGuardianException();
			}
			throw e;
		}
	}

	async activate(id: string): Promise<void> {
		await this.db.client
			.update(guardianships)
			.set({ status: GuardianshipStatusEnum.ACTIVE })
			.where(eq(guardianships.id, id));
	}

	async cancel(id: string, cancelledAt: Date): Promise<void> {
		await this.db.client
			.update(guardianships)
			.set({ status: GuardianshipStatusEnum.CANCELLED, cancelledAt, cancellationToken: null })
			.where(eq(guardianships.id, id));
	}
}
