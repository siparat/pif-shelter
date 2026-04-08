import { meetingRequests } from '@pif/database';

export type CreateMeetingRequestInput = {
	animalId: string;
	curatorUserId: string;
	name: string;
	phone: string;
	email: string | null;
	comment: string | null;
	meetingAt: Date;
	idempotencyKey: string;
};

export abstract class MeetingRequestsRepository {
	abstract createIdempotent(
		input: CreateMeetingRequestInput
	): Promise<{ entity: typeof meetingRequests.$inferSelect; isAlreadyExists: boolean }>;
	abstract findById(id: string): Promise<typeof meetingRequests.$inferSelect | undefined>;
	abstract findAnimalWithCurator(animalId: string): Promise<{ id: string; curatorId: string | null } | undefined>;
	abstract create(input: CreateMeetingRequestInput): Promise<typeof meetingRequests.$inferSelect>;
	abstract confirm(id: string, now: Date): Promise<typeof meetingRequests.$inferSelect | undefined>;
	abstract reject(id: string, now: Date, reason: string): Promise<typeof meetingRequests.$inferSelect | undefined>;
}
