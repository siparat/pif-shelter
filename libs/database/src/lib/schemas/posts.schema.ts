import { PostVisibilityEnum, PostMediaTypeEnum } from '@pif/shared';
import { index, integer, pgEnum, pgTable, smallint, text, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './timestamps';
import { animals } from './animals.schema';
import { users } from './users.schema';

export const postVisibilityEnum = pgEnum('post_visibility', PostVisibilityEnum);

export const postMediaTypeEnum = pgEnum('post_media_type', PostMediaTypeEnum);

export const posts = pgTable(
	'posts',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		animalId: uuid('animal_id')
			.notNull()
			.references(() => animals.id, { onDelete: 'cascade' }),
		authorId: text('author_id')
			.notNull()
			.references(() => users.id),
		title: text('title').notNull(),
		body: text('body').notNull(),
		visibility: postVisibilityEnum('visibility').notNull(),
		campaignId: uuid('campaign_id'),
		animalAgeYears: integer('animal_age_years').notNull(),
		animalAgeMonths: integer('animal_age_months').notNull(),
		...timestamps
	},
	(table) => [
		index('posts_animal_id_idx').on(table.animalId),
		index('posts_author_id_idx').on(table.authorId),
		index('posts_created_at_idx').on(table.createdAt)
	]
);

export const postMedia = pgTable(
	'post_media',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		postId: uuid('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		storageKey: text('storage_key').notNull(),
		type: postMediaTypeEnum('type').notNull(),
		order: smallint('order').notNull(),
		...timestamps
	},
	(table) => [index('post_media_post_id_idx').on(table.postId)]
);
