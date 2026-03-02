import { GuardianshipStatusEnum } from '@pif/shared';
import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { animals } from './animals.schema';
import { users } from './users.schema';

export const guardianshipStatusEnum = pgEnum('guardianship_status', GuardianshipStatusEnum);

export const guardianships = pgTable(
	'guardianships',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		animalId: uuid('animal_id')
			.notNull()
			.references(() => animals.id, { onDelete: 'cascade' }),
		guardianUserId: text('guardian_user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		monthlyAmount: text('monthly_amount').notNull(),
		status: guardianshipStatusEnum('status').default(GuardianshipStatusEnum.PENDING_PAYMENT).notNull(),
		subscriptionId: text('subscription_id').notNull(),
		startedAt: timestamp('started_at').defaultNow().notNull(),
		cancelledAt: timestamp('cancelled_at')
	},
	(table) => [
		index('guardianships_animal_id_idx').on(table.animalId),
		index('guardianships_guardian_user_id_idx').on(table.guardianUserId),
		uniqueIndex('guardianships_animal_guardian_unique_idx').on(table.animalId, table.guardianUserId)
	]
);
