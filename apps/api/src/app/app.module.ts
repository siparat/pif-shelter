import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@pif/config';
import { DatabaseModule } from '@pif/database';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { AnimalsModule } from './animals/animals.module';
import { HealthModule } from './core/health/health.module';
import { getDatabaseConfig } from './configs/database.config';
import { getLoggerConfig } from './configs/logger.config';
import { getClsConfig } from './configs/cls.config';
import { GlobalExceptionsFilter } from './core/filters/global-exceptions.filter';
import { ZodValidationExceptionFilter } from './core/filters/zod-exception.filter';

@Module({
	imports: [
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
			provide: APP_FILTER,
			useClass: GlobalExceptionsFilter
		},
		{
			provide: APP_FILTER,
			useClass: ZodValidationExceptionFilter
		}
	]
})
export class AppModule {}
