import { S3Client } from '@aws-sdk/client-s3';
import { DynamicModule, Module } from '@nestjs/common';
import { S3Adapter } from './adapters/s3/s3.adapter';
import { S3_PROVIDE_KEY } from './adapters/s3/s3.constants';
import { IS3AsyncOptions, IS3Provider } from './adapters/s3/s3.types';
import { IStorageOptions } from './interfaces/storage.interface';
import { StorageService } from './storage.service.interface';

@Module({
	controllers: [],
	providers: [],
	exports: []
})
export class StorageModule {
	static forRootAsync({ adapter, options }: IStorageOptions): DynamicModule {
		switch (adapter) {
			case 'S3':
				return this.getS3Module(options);
			default:
				throw new Error('Invalid storage adapter');
		}
	}

	private static getS3Module(options: IS3AsyncOptions): DynamicModule {
		return {
			global: true,
			imports: options.imports || [],
			module: StorageModule,
			providers: [
				{
					provide: S3_PROVIDE_KEY,
					useFactory: async (...args: unknown[]): Promise<IS3Provider> => {
						const result = await options.useFactory(...args);
						return {
							client: new S3Client({
								region: result.region,
								credentials: { accessKeyId: result.accessKey, secretAccessKey: result.secretAccessKey },
								endpoint: result.baseUrl,
								forcePathStyle: true,
								requestChecksumCalculation: 'WHEN_REQUIRED',
								responseChecksumValidation: 'WHEN_REQUIRED'
							}),
							bucket: result.bucket
						};
					},
					inject: options.inject || []
				},
				{
					provide: StorageService,
					useClass: S3Adapter
				}
			],
			exports: [S3_PROVIDE_KEY, StorageService]
		};
	}
}
