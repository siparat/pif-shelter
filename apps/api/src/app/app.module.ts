import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@pif/config';
import { DatabaseModule } from '@pif/database';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { AdminUsersModule } from './admin/users/users.module';
import { AnimalsModule } from './animals/animals.module';
import { getAuthConfig } from './configs/auth.config';
import { getClsConfig } from './configs/cls.config';
import { getDatabaseConfig } from './configs/database.config';
import { getLoggerConfig } from './configs/logger.config';
import { getMailerConfig } from './configs/mailer.config';
import { getThrottlerConfig } from './configs/throttler.config';
import { BetterAuthExceptionsFilter } from './core/filters/better-auth-exceptions.filter';
import { GlobalExceptionsFilter } from './core/filters/global-exceptions.filter';
import { ThrottlerExceptionFilter } from './core/filters/throttler-exception.filter';
import { ZodValidationExceptionFilter } from './core/filters/zod-exception.filter';
import { HealthModule } from './core/health/health.module';
import { SeedModule } from './core/seed/seed.module';

@Module({
	imports: [
		CqrsModule.forRoot(),
		ThrottlerModule.forRoot(getThrottlerConfig()),
		ClsModule.forRoot(getClsConfig()),
		LoggerModule.forRootAsync(getLoggerConfig()),
		DatabaseModule.forRootAsync(getDatabaseConfig()),
		AuthModule.forRootAsync(getAuthConfig()),
		MailerModule.forRootAsync(getMailerConfig()),
		ConfigModule,
		AnimalsModule,
		AdminUsersModule,
		HealthModule,
		SeedModule
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard
		},
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionsFilter
		},
		{
			provide: APP_FILTER,
			useClass: ZodValidationExceptionFilter
		},
		{
			provide: APP_FILTER,
			useClass: ThrottlerExceptionFilter
		},
		{
			provide: APP_FILTER,
			useClass: BetterAuthExceptionsFilter
		}
	]
})
export class AppModule {}
