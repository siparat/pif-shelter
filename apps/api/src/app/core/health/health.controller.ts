import { Controller, Get } from '@nestjs/common';
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckResult,
	HealthCheckService,
	HealthIndicatorResult,
	MemoryHealthIndicator
} from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './database.health';

@Controller('health')
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private db: DatabaseHealthIndicator,
		private memory: MemoryHealthIndicator,
		private disk: DiskHealthIndicator
	) {}

	@Get()
	@HealthCheck()
	check(): Promise<HealthCheckResult> {
		return this.health.check([
			(): Promise<HealthIndicatorResult> => this.db.isHealthy('database'),
			(): Promise<HealthIndicatorResult> => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
			(): Promise<HealthIndicatorResult> =>
				this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 })
		]);
	}
}
