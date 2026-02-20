import { S3Client } from '@aws-sdk/client-s3';
import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

export interface IS3Options {
	region: string;
	accessKey: string;
	secretAccessKey: string;
	bucket: string;
	baseUrl: string;
}

export type IS3AsyncOptions = Pick<FactoryProvider<IS3Options>, 'inject' | 'useFactory'> &
	Pick<ModuleMetadata, 'imports'>;

export interface IS3Provider {
	client: S3Client;
	bucket: string;
}
