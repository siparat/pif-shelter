import { DynamicModule, Module, OnModuleDestroy, Inject } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DatabaseService } from './database.service';
import { DRIZZLE_PROVIDE_KEY } from './constants/drizzle-providers.constants';
import { IDatabaseModuleAsyncOptions, IDatabaseModuleOptions } from './interfaces/drizzle.interface';
import { relations, schema } from './schemas';

const POOL_PROVIDER_KEY = 'DATABASE_POOL';

@Module({})
export class DatabaseModule implements OnModuleDestroy {
	constructor(@Inject(POOL_PROVIDER_KEY) private readonly pool: Pool) {}

	static forRoot({ url }: IDatabaseModuleOptions): DynamicModule {
		const pool = new Pool({ connectionString: url });
		const db = drizzle({ schema, relations, client: pool, casing: 'snake_case' });

		return {
			global: true,
			module: DatabaseModule,
			providers: [
				DatabaseService,
				{ provide: POOL_PROVIDER_KEY, useValue: pool },
				{ provide: DRIZZLE_PROVIDE_KEY, useValue: db }
			],
			exports: [DatabaseService, DRIZZLE_PROVIDE_KEY]
		};
	}

	static forRootAsync(options: IDatabaseModuleAsyncOptions): DynamicModule {
		return {
			global: true,
			module: DatabaseModule,
			imports: options.imports,
			providers: [
				DatabaseService,
				{
					provide: POOL_PROVIDER_KEY,
					inject: options.inject,
					useFactory: async (...args: unknown[]) => {
						const { url } = await options.useFactory(...args);
						return new Pool({ connectionString: url });
					}
				},
				{
					provide: DRIZZLE_PROVIDE_KEY,
					inject: [POOL_PROVIDER_KEY],
					useFactory: (pool: Pool) => {
						return drizzle({ schema, relations, client: pool, casing: 'snake_case' });
					}
				}
			],
			exports: [DatabaseService, DRIZZLE_PROVIDE_KEY]
		};
	}

	async onModuleDestroy(): Promise<void> {
		await this.pool.end();
	}
}
