import { Injectable } from '@nestjs/common';
import { animals, DatabaseService, meetingRequests, users } from '@pif/database';
import { MeetingRequestStatusEnum } from '@pif/shared';
import { and, eq } from 'drizzle-orm';
import { CreateMeetingRequestInput, MeetingRequestsRepository } from './meeting-requests.repository';

@Injectable()
export class DrizzleMeetingRequestsRepository extends MeetingRequestsRepository {
	constructor(private readonly db: DatabaseService) {
		super();
	}

	findById(id: string): Promise<typeof meetingRequests.$inferSelect | undefined> {
		return this.db.client.query.meetingRequests.findFirst({ where: { id } });
	}

	findAnimalWithCurator(animalId: string): Promise<{ id: string; curatorId: string | null } | undefined> {
		return this.db.client.query.animals.findFirst({
			where: { id: animalId },
			columns: { id: true, curatorId: true }
		});
	}

	async create(input: CreateMeetingRequestInput): Promise<typeof meetingRequests.$inferSelect> {
		const [created] = await this.db.client.insert(meetingRequests).values(input).returning();
		return created;
	}

	async confirm(id: string, now: Date): Promise<typeof meetingRequests.$inferSelect | undefined> {
		const [updated] = await this.db.client
			.update(meetingRequests)
			.set({
				status: MeetingRequestStatusEnum.CONFIRMED,
				confirmedAt: now,
				rejectedAt: null,
				rejectionReason: null
			})
			.where(and(eq(meetingRequests.id, id), eq(meetingRequests.status, MeetingRequestStatusEnum.NEW)))
			.returning();
		return updated;
	}

	async reject(id: string, now: Date, reason: string): Promise<typeof meetingRequests.$inferSelect | undefined> {
		const [updated] = await this.db.client
			.update(meetingRequests)
			.set({
				status: MeetingRequestStatusEnum.REJECTED,
				rejectedAt: now,
				rejectionReason: reason,
				confirmedAt: null
			})
			.where(and(eq(meetingRequests.id, id), eq(meetingRequests.status, MeetingRequestStatusEnum.NEW)))
			.returning();
		return updated;
	}

	async getDetailedById(id: string): Promise<
		| {
				request: typeof meetingRequests.$inferSelect;
				animal: { id: string; name: string; avatarUrl: string | null };
				curator: { id: string; name: string | null; email: string | null };
		  }
		| undefined
	> {
		const [row] = await this.db.client
			.select({
				request: meetingRequests,
				animal: { id: animals.id, name: animals.name, avatarUrl: animals.avatarUrl },
				curator: { id: users.id, name: users.name, email: users.email }
			})
			.from(meetingRequests)
			.innerJoin(animals, eq(animals.id, meetingRequests.animalId))
			.innerJoin(users, eq(users.id, meetingRequests.curatorUserId))
			.where(eq(meetingRequests.id, id));
		return row;
	}
}
