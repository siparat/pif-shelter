import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { RedisClientType } from 'redis';
import { CACHE_REDIS_CLIENT } from '../cache.constants';
import { Inject } from '@nestjs/common';

@Injectable()
export class CacheHealthIndicator {
	constructor(
		private readonly healthIndicatorService: HealthIndicatorService,
		@Inject(CACHE_REDIS_CLIENT) private readonly client: RedisClientType
	) {}

	async isHealthy(key: string): Promise<HealthIndicatorResult> {
		const indicator = this.healthIndicatorService.check(key);
		try {
			await this.client.ping();
			return indicator.up();
		} catch (error) {
			return indicator.down({ message: error instanceof Error ? error.message : 'Unknown error' });
		}
	}
}
