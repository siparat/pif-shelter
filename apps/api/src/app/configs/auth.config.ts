import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@pif/config';
import { DRIZZLE_PROVIDE_KEY, relations, schema } from '@pif/database';
import { AUTH_PREFIX, UserRole } from '@pif/shared';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { APIError, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const createAuth = (config: ConfigService, db: NodePgDatabase<typeof schema, typeof relations>) =>
	betterAuth({
		secret: config.getOrThrow('SECRET'),
		basePath: AUTH_PREFIX,
		database: drizzleAdapter(db, { provider: 'pg', usePlural: true }),
		advanced: { cookiePrefix: 'auth', crossSubDomainCookies: { enabled: true } },
		baseURL: config.getOrThrow('BASE_URL'),
		trustedOrigins: config.getOrThrow<string>('ALLOWED_ORIGINS').split(','),
		logger: { disabled: true },
		emailAndPassword: {
			enabled: true
		},
		hooks: {
			before: async (context) => {
				if (!('path' in context) || !context.headers) {
					return { context };
				}
				if (context.path === '/sign-up/email') {
					throw new APIError(HttpStatus.METHOD_NOT_ALLOWED, { message: 'Регистрация отключена' });
				}
				return { context };
			}
		},
		databaseHooks: {
			user: { create: { before: async (user) => ({ data: { ...user, emailVerified: true } }) } }
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
export type Session = AppAuth['$Infer']['Session'] & { user: { role: UserRole } };

export const getAuthConfig = (): Parameters<typeof AuthModule.forRootAsync>[0] => ({
	disableGlobalAuthGuard: true,
	isGlobal: true,
	imports: [ConfigModule],
	inject: [ConfigService, DRIZZLE_PROVIDE_KEY],
	useFactory: (config: ConfigService, db: NodePgDatabase<typeof schema, typeof relations>) => ({
		auth: createAuth(config, db)
	})
});
