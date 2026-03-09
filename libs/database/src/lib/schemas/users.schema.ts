import { UserRole } from '@pif/shared';
import { boolean, index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './timestamps';

export const roleEnum = pgEnum('role', UserRole);

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	image: text('image'),
	...timestamps,

	role: roleEnum('role').default(UserRole.VOLUNTEER).notNull(),
	position: text('position').notNull(),
	banned: boolean('banned').default(false).notNull(),
	telegram: text('telegram').notNull().unique(),
	telegramChatId: text('telegram_chat_id'),
	telegramChatIdUpdatedAt: timestamp('telegram_chat_id_updated_at'),
	telegramUnreachable: boolean('telegram_unreachable').default(false).notNull(),
	telegramBotLinkToken: uuid('telegram_bot_link_token').unique()
});

export const sessions = pgTable(
	'sessions',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at').notNull(),
		token: text('token').notNull().unique(),
		...timestamps,
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
	},
	(table) => [index('sessions_userId_idx').on(table.userId)]
);

export const accounts = pgTable(
	'accounts',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		...timestamps
	},
	(table) => [index('accounts_userId_idx').on(table.userId)]
);

export const verifications = pgTable(
	'verifications',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		...timestamps
	},
	(table) => [index('verifications_identifier_idx').on(table.identifier)]
);

export const invitations = pgTable(
	'invitations',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		expiresAt: timestamp('expires_at').notNull(),
		personName: text('person_name').notNull(),
		roleName: text('role_name').notNull(),
		token: uuid('token').notNull().defaultRandom(),
		email: text('email').notNull(),
		used: boolean('used').notNull().default(false),
		userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
		...timestamps
	},
	(table) => [index('invitations_email_idx').on(table.email)]
);
