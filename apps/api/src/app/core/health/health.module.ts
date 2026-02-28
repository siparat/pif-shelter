import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { CacheHealthIndicator } from '@pif/cache';
import { DatabaseHealthIndicator } from '@pif/database';
import { HealthController } from './health.controller';

@Module({
	imports: [TerminusModule],
	controllers: [HealthController],
	providers: [DatabaseHealthIndicator, CacheHealthIndicator]
})
export class HealthModule {}
