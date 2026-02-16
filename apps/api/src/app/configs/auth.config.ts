import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@pif/config';
import { DRIZZLE_PROVIDE_KEY, relations, schema } from '@pif/database';
import { UserRole } from '@pif/shared';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const createAuth = (config: ConfigService, db: NodePgDatabase<typeof schema, typeof relations>) =>
	betterAuth({
		basePath: 'auth',
		database: drizzleAdapter(db, { provider: 'pg', usePlural: true }),
		advanced: { cookiePrefix: 'auth', crossSubDomainCookies: { enabled: true } },
		baseURL: config.getOrThrow('BASE_URL'),
		trustedOrigins: config.getOrThrow<string>('ALLOWED_ORIGINS').split(','),
		emailAndPassword: {
			enabled: true,
			disableSignUp: true
		},
		user: {
			additionalFields: {
				role: {
					type: 'string',
					required: true,
					defaultValue: UserRole.VOLUNTEER
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
		plugins: [openAPI()]
	});

export type AppAuth = ReturnType<typeof createAuth>;

export const getAuthConfig = (): Parameters<typeof AuthModule.forRootAsync>[0] => ({
	isGlobal: true,
	imports: [ConfigModule],
	inject: [ConfigService, DRIZZLE_PROVIDE_KEY],
	useFactory: (config: ConfigService, db: NodePgDatabase<typeof schema, typeof relations>) => ({
		auth: createAuth(config, db)
	})
});
