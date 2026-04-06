import { WishlistItemStatusEnum } from '@pif/shared';
import { index, integer, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './timestamps';

export const wishlistItemStatusEnum = pgEnum('wishlist_item_status', WishlistItemStatusEnum);

export const wishlistCategories = pgTable(
	'wishlist_categories',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: text('name').notNull(),
		sortOrder: integer('sort_order').notNull().default(0),
		...timestamps
	},
	(table) => [index('wishlist_categories_sort_order_idx').on(table.sortOrder)]
);

export const wishlistItems = pgTable(
	'wishlist_items',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		categoryId: uuid('category_id')
			.notNull()
			.references(() => wishlistCategories.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		status: wishlistItemStatusEnum('status').notNull().default(WishlistItemStatusEnum.ALWAYS_NEEDED),
		sortOrder: integer('sort_order').notNull().default(0),
		...timestamps
	},
	(table) => [
		index('wishlist_items_category_id_idx').on(table.categoryId),
		index('wishlist_items_category_sort_idx').on(table.categoryId, table.sortOrder)
	]
);
