import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

export interface ICacheModuleOptions {
	uri: string;
	ttlSeconds: number;
	keyPrefix: string;
	hashSalt: string;
}

export interface ICacheModuleAsyncOptions
	extends Pick<FactoryProvider<ICacheModuleOptions>, 'inject' | 'useFactory'>,
		Pick<ModuleMetadata, 'imports'> {}
