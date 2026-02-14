import { Controller, Get } from '@nestjs/common';
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckResult,
	HealthCheckService,
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
			() => this.db.isHealthy('database'),
			() => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
			() => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 })
		]);
	}
}
