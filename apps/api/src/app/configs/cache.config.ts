import { ConfigService } from '@nestjs/config';
import { ICacheModuleAsyncOptions } from '@pif/cache';
import { ConfigModule } from '@pif/config';

export const getCacheConfig = (): ICacheModuleAsyncOptions => ({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (config: ConfigService) => ({
		uri: config.getOrThrow<string>('REDIS_URL'),
		ttlSeconds: config.getOrThrow<number>('REDIS_TTL_SECONDS'),
		keyPrefix: config.getOrThrow<string>('REDIS_KEY_PREFIX'),
		hashSalt: config.getOrThrow<string>('REDIS_HASH_SALT')
	})
});
