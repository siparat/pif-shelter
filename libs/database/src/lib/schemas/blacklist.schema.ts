import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { BlacklistContext, BlacklistSource, BlacklistStatus } from '@pif/shared';

export const blacklistSourceEnum = pgEnum('blacklist_source', BlacklistSource);
export const blacklistContextEnum = pgEnum('blacklist_context', BlacklistContext);
export const blacklistStatusEnum = pgEnum('blacklist_status', BlacklistStatus);

export const blacklist = pgTable(
	'blacklist',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		context: blacklistContextEnum('context').notNull(),
		source: blacklistSourceEnum('source').notNull(),
		value: text('value').notNull(),
		reason: text('reason'),
		status: blacklistStatusEnum('status').notNull().default(BlacklistStatus.SUSPICION),
		moderatorId: text('moderator_id').references(() => users.id),
		expiredAt: timestamp('expired_at'),
		blockedAt: timestamp('blocked_at'),
		appealedAt: timestamp('appeealed_at'),
		addedAt: timestamp('added_at').defaultNow()
	},
	(table) => [
		index('blacklist_status_idx').on(table.status),
		index('blacklist_expired_idx').on(table.expiredAt),
		uniqueIndex('blacklist_source_value_uk').on(table.source, table.value)
	]
);
