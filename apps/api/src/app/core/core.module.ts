import { Global, Module } from '@nestjs/common';
import { FileStoragePolicy } from './policies/file-storage.policy';

@Global()
@Module({
	providers: [FileStoragePolicy],
	exports: [FileStoragePolicy]
})
export class CoreModule {}
