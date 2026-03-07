import { pgTable, text } from 'drizzle-orm/pg-core';

export const botHelpConfig = pgTable('bot_help_config', {
	key: text('key').primaryKey(),
	value: text('value').notNull()
});
