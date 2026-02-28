import { DynamicModule, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { CACHE_MODULE_OPTIONS, CACHE_REDIS_CLIENT } from './cache.constants';
import { CacheService } from './cache.service';
import { ICacheModuleAsyncOptions, ICacheModuleOptions } from './interfaces/cache.interface';

@Module({})
export class CacheModule {
	static forRoot(options: ICacheModuleOptions): DynamicModule {
		return {
			global: true,
			module: CacheModule,
			providers: [
				CacheService,
				{
					provide: CACHE_MODULE_OPTIONS,
					useValue: options
				},
				{
					provide: CACHE_REDIS_CLIENT,
					inject: [CACHE_MODULE_OPTIONS],
					useFactory: async (moduleOptions: ICacheModuleOptions) => {
						const client = createClient({ url: moduleOptions.uri });
						await client.connect();
						return client;
					}
				}
			],
			exports: [CacheService, CACHE_REDIS_CLIENT]
		};
	}

	static forRootAsync(options: ICacheModuleAsyncOptions): DynamicModule {
		return {
			global: true,
			module: CacheModule,
			imports: options.imports,
			providers: [
				CacheService,
				{
					provide: CACHE_MODULE_OPTIONS,
					inject: options.inject,
					useFactory: options.useFactory
				},
				{
					provide: CACHE_REDIS_CLIENT,
					inject: [CACHE_MODULE_OPTIONS],
					useFactory: async (moduleOptions: ICacheModuleOptions) => {
						const client = createClient({ url: moduleOptions.uri });
						await client.connect();
						return client;
					}
				}
			],
			exports: [CacheService, CACHE_REDIS_CLIENT]
		};
	}
}
