import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@pif/config';
import { DatabaseModule } from '@pif/database';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { AnimalsModule } from './animals/animals.module';
import { getClsConfig } from './configs/cls.config';
import { getDatabaseConfig } from './configs/database.config';
import { getLoggerConfig } from './configs/logger.config';
import { getThrottlerConfig } from './configs/throttler.config';
import { GlobalExceptionsFilter } from './core/filters/global-exceptions.filter';
import { ZodValidationExceptionFilter } from './core/filters/zod-exception.filter';
import { HealthModule } from './core/health/health.module';
import { ThrottlerExceptionFilter } from './core/filters/throttler-exception.filter';

@Module({
	imports: [
		ThrottlerModule.forRoot(getThrottlerConfig()),
		ClsModule.forRoot(getClsConfig()),
		LoggerModule.forRootAsync(getLoggerConfig()),
		CqrsModule.forRoot(),
		ConfigModule,
		DatabaseModule.forRootAsync(getDatabaseConfig()),
		AnimalsModule,
		HealthModule
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
		}
	]
})
export class AppModule {}
