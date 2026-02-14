import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL;
if (!url) {
	throw new Error('DATABASE_URL is not defined');
}

export default defineConfig({
	schema: './libs/database/src/lib/schemas/*.schema.ts',
	out: './migrations',
	dialect: 'postgresql',
	casing: 'snake_case',
	dbCredentials: { url },
	verbose: true,
	strict: true
});
