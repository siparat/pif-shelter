import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
import { defineConfig } from 'drizzle-kit';

const env = dotenv.config({ path: '.env.api' });
expand(env);

const url = process.env.DATABASE_URL;
if (!url) {
	throw new Error('DATABASE_URL is not defined');
}

export default defineConfig({
	schema: './apps/api/src/app/**/*.schema.ts',
	out: './apps/api/migrations',
	dialect: 'postgresql',
	casing: 'snake_case',
	dbCredentials: { url },
	verbose: true,
	strict: true,
});
