import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { createHash } from 'crypto';
import { RedisClientType } from 'redis';
import { CACHE_MODULE_OPTIONS, CACHE_REDIS_CLIENT } from './cache.constants';
import { ICacheModuleOptions } from './interfaces/cache.interface';

@Injectable()
export class CacheService implements OnModuleDestroy {
	private readonly prefix: string;
	private readonly hashSalt: string;

	constructor(
		@Inject(CACHE_REDIS_CLIENT) private readonly client: RedisClientType,
		@Inject(CACHE_MODULE_OPTIONS) private readonly options: ICacheModuleOptions
	) {
		this.prefix = options.keyPrefix;
		this.hashSalt = options.hashSalt;
	}

	public async onModuleDestroy(): Promise<void> {
		await this.client.quit();
	}

	public buildQueryKey(namespace: string, query: unknown): string {
		const payload = this.stableSerialize(query);
		const hash = createHash('sha256').update(this.hashSalt).update(payload).digest('hex');
		return `${namespace}:${hash}`;
	}

	public async get<T>(key: string): Promise<T | null> {
		const fullKey = this.withPrefix(key);
		const value = await this.client.get(fullKey);
		if (value === null) {
			return null;
		}
		return JSON.parse(value) as T;
	}

	public async set<T>(key: string, value: T, ttlSeconds = this.options.ttlSeconds): Promise<void> {
		const fullKey = this.withPrefix(key);
		const payload = JSON.stringify(value);
		await this.client.set(fullKey, payload, { EX: ttlSeconds });
	}

	public async del(key: string): Promise<void> {
		const fullKey = this.withPrefix(key);
		await this.client.del(fullKey);
	}

	private withPrefix(key: string): string {
		return `${this.prefix}:${key}`;
	}

	private stableSerialize(value: unknown): string {
		if (value === undefined) {
			return '"__undefined__"';
		}

		if (value === null || typeof value !== 'object') {
			return JSON.stringify(value);
		}

		if (Array.isArray(value)) {
			return `[${value.map((item) => this.stableSerialize(item)).join(',')}]`;
		}

		if (value instanceof Date) {
			return JSON.stringify(value.toISOString());
		}

		const entries = Object.entries(value)
			.filter(([, item]) => item !== undefined)
			.sort(([left], [right]) => left.localeCompare(right));

		const serialized = entries.map(([key, item]) => `${JSON.stringify(key)}:${this.stableSerialize(item)}`);
		return `{${serialized.join(',')}}`;
	}
}
