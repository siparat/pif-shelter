import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

export interface IDatabaseModuleOptions {
	url: string;
}

export interface IDatabaseModuleAsyncOptions
	extends Pick<FactoryProvider<IDatabaseModuleOptions>, 'inject' | 'useFactory'>,
		Pick<ModuleMetadata, 'imports'> {}
