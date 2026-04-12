import { Global, Module } from '@nestjs/common';
import { FileStoragePolicy } from './policies/file-storage.policy';
import { BlacklistPolicy } from './policies/blacklist.policy';

@Global()
@Module({
	providers: [FileStoragePolicy, BlacklistPolicy],
	exports: [FileStoragePolicy, BlacklistPolicy]
})
export class CoreModule {}
