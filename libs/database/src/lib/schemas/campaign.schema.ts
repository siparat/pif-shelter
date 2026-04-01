import { CampaignStatus } from '@pif/shared';
import { isNull, sql } from 'drizzle-orm';
import { check, index, integer, pgEnum, pgTable, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { animals } from './animals.schema';
import { timestamps } from './timestamps';

export const campaignStatusEnum = pgEnum('campaign_status', CampaignStatus);

export const campaigns = pgTable(
	'campaigns',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		title: text('title').notNull(),
		description: text('description'),
		collected: integer('collected').notNull().default(0),
		goal: integer('goal').notNull(),
		order: smallint('order').notNull().generatedByDefaultAsIdentity(),
		previewImage: text('preview_image'),
		status: campaignStatusEnum('status').notNull().default(CampaignStatus.DRAFT),
		animalId: uuid('animal_id').references(() => animals.id, { onDelete: 'set null' }),
		startsAt: timestamp('starts_at').notNull().defaultNow(),
		endsAt: timestamp('ends_at').notNull(),
		...timestamps
	},
	(table) => [
		index('campaigns_animal_id_idx').on(table.animalId),
		index('campaigns_status_ends_at_idx').on(table.status, table.endsAt).where(isNull(table.deletedAt)),
		check('campaigns_positive_collected_check', sql`${table.collected} >= 0 `),
		check('campaigns_positive_goal_check', sql`${table.goal} >= 0 `)
	]
);
