import { Injectable } from '@nestjs/common';
import { animals, DatabaseService, meetingRequests, users } from '@pif/database';
import { MEETING_FORM_ABUSE_THRESHOLD, MEETING_FORM_ABUSE_WINDOW_MS, MeetingRequestStatusEnum } from '@pif/shared';
import { and, count, eq, gte } from 'drizzle-orm';
import {
	CreateMeetingRequestIdempotentResult,
	CreateMeetingRequestInput,
	MeetingRequestsRepository
} from './meeting-requests.repository';

@Injectable()
export class DrizzleMeetingRequestsRepository extends MeetingRequestsRepository {
	constructor(private readonly db: DatabaseService) {
		super();
	}

	async createIdempotent(input: CreateMeetingRequestInput): Promise<CreateMeetingRequestIdempotentResult> {
		return this.db.client.transaction(async (tx) => {
			const [created] = await tx
				.insert(meetingRequests)
				.values(input)
				.onConflictDoNothing({ target: meetingRequests.idempotencyKey })
				.returning();
			if (created) {
				const since = new Date(Date.now() - MEETING_FORM_ABUSE_WINDOW_MS);
				const [phoneRow] = await tx
					.select({ c: count() })
					.from(meetingRequests)
					.where(
						and(
							eq(meetingRequests.animalId, input.animalId),
							eq(meetingRequests.phone, input.phone),
							gte(meetingRequests.createdAt, since)
						)
					);
				const phoneCount = Number(phoneRow?.c ?? 0);
				let emailCount = 0;
				if (input.email) {
					const [emailRow] = await tx
						.select({ c: count() })
						.from(meetingRequests)
						.where(
							and(
								eq(meetingRequests.animalId, input.animalId),
								eq(meetingRequests.email, input.email),
								gte(meetingRequests.createdAt, since)
							)
						);
					emailCount = Number(emailRow?.c ?? 0);
				}
				return {
					entity: created,
					isAlreadyExists: false,
					meetingFormAbuse: {
						suspectPhone: phoneCount >= MEETING_FORM_ABUSE_THRESHOLD,
						suspectEmail: input.email ? emailCount >= MEETING_FORM_ABUSE_THRESHOLD : false
					}
				};
			}
			const [alreadyCreated] = await tx
				.select()
				.from(meetingRequests)
				.where(eq(meetingRequests.idempotencyKey, input.idempotencyKey))
				.limit(1);
			if (alreadyCreated) {
				return {
					entity: alreadyCreated,
					isAlreadyExists: true,
					meetingFormAbuse: { suspectPhone: false, suspectEmail: false }
				};
			}
			throw new Error('Ошибка записи в базу данных, попробуйте еще раз');
		});
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
