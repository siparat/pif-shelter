import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckResult,
	HealthCheckService,
	HealthIndicatorResult,
	MemoryHealthIndicator
} from '@nestjs/terminus';
import { DatabaseHealthIndicator } from '@pif/database';

@Controller('health')
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private db: DatabaseHealthIndicator,
		private memory: MemoryHealthIndicator,
		private disk: DiskHealthIndicator,
		private config: ConfigService
	) {}

	@Get()
	@HealthCheck()
	check(): Promise<HealthCheckResult> {
		const diskThreshold = this.config.get<number>('HEALTH_DISK_THRESHOLD_PERCENT', 0.9);
		const memoryThreshold = this.config.get<number>('HEALTH_MEMORY_THRESHOLD', 300 * 1024 * 1024);

		return this.health.check([
			(): Promise<HealthIndicatorResult> => this.db.isHealthy('database'),
			(): Promise<HealthIndicatorResult> => this.memory.checkHeap('memory_heap', memoryThreshold),
			(): Promise<HealthIndicatorResult> =>
				this.disk.checkStorage('storage', { path: '/', thresholdPercent: diskThreshold })
		]);
	}
}
