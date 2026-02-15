import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, casing: 'snake_case' });

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		usePlural: true
	}),
	emailAndPassword: {
		enabled: true
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: true,
				defaultValue: 'VOLUNTEER'
			},
			position: {
				type: 'string',
				required: false
			},
			banned: {
				type: 'boolean',
				required: true,
				defaultValue: false
			}
		}
	},
	plugins: []
});
