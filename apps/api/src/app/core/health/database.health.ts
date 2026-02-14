import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { DatabaseService } from '@pif/database';
import { sql } from 'drizzle-orm';

@Injectable()
export class DatabaseHealthIndicator {
	constructor(
		private healthIndicatorService: HealthIndicatorService,
		private db: DatabaseService
	) {}

	async isHealthy(key: string): Promise<HealthIndicatorResult> {
		const indicator = this.healthIndicatorService.check(key);
		try {
			await this.db.client.execute(sql`SELECT 1`);
			return indicator.up();
		} catch (error) {
			return indicator.down({ message: error.message });
		}
	}
}
