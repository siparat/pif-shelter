import { DynamicModule, Module, OnModuleDestroy, Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DRIZZLE_PROVIDE_KEY } from './constants/drizzle-providers.constants';
import { DatabaseService } from './database.service';
import { IDatabaseModuleAsyncOptions, IDatabaseModuleOptions } from './interfaces/drizzle.interface';
import * as schema from './schemas';

@Module({})
export class DatabaseModule implements OnModuleDestroy {
	private static pool?: Pool;

	static forRoot({ url }: IDatabaseModuleOptions): DynamicModule {
		const pool = new Pool({ connectionString: url });
		const db = drizzle(pool, { schema, casing: 'snake_case' });

		this.pool = pool;

		return {
			global: true,
			module: DatabaseModule,
			providers: [DatabaseService, { provide: DRIZZLE_PROVIDE_KEY, useValue: db }],
			exports: [DatabaseService, DRIZZLE_PROVIDE_KEY]
		};
	}

	static forRootAsync(options: IDatabaseModuleAsyncOptions): DynamicModule {
		const asyncProvider = DatabaseModule.createAsyncOptionsProvider(options);

		return {
			global: true,
			module: DatabaseModule,
			imports: options.imports,
			providers: [DatabaseService, asyncProvider],
			exports: [DatabaseService, DRIZZLE_PROVIDE_KEY]
		};
	}

	private static createAsyncOptionsProvider(options: IDatabaseModuleAsyncOptions): Provider {
		return {
			provide: DRIZZLE_PROVIDE_KEY,
			inject: options.inject,
			useFactory: async (...args: unknown[]): Promise<ReturnType<typeof drizzle>> => {
				const { url } = await options.useFactory(...args);
				const pool = new Pool({ connectionString: url });
				this.pool = pool;
				return drizzle(pool, { schema, casing: 'snake_case' });
			}
		};
	}

	async onModuleDestroy(): Promise<void> {
		await DatabaseModule.pool?.end();
	}
}
