import { MeetingRequestStatusEnum } from '@pif/shared';
import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { animals } from './animals.schema';
import { users } from './users.schema';

export const meetingRequestStatusEnum = pgEnum('meeting_request_status', MeetingRequestStatusEnum);

export const meetingRequests = pgTable(
	'meeting_requests',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		animalId: uuid('animal_id')
			.notNull()
			.references(() => animals.id, { onDelete: 'cascade' }),
		curatorUserId: text('curator_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		phone: text('phone').notNull(),
		email: text('email'),
		comment: text('comment'),
		meetingAt: timestamp('meeting_at').notNull(),
		status: meetingRequestStatusEnum('status').notNull().default(MeetingRequestStatusEnum.NEW),
		confirmedAt: timestamp('confirmed_at'),
		rejectedAt: timestamp('rejected_at'),
		rejectionReason: text('rejection_reason'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
	},
	(table) => [
		index('meeting_requests_animal_status_idx').on(table.animalId, table.status),
		index('meeting_requests_curator_status_idx').on(table.curatorUserId, table.status),
		index('meeting_requests_meeting_status_idx').on(table.meetingAt, table.status)
	]
);
