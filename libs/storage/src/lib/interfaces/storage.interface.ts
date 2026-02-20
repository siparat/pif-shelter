import { IS3AsyncOptions } from '../adapters/s3/s3.types';

export type IStorageOptions = {
	adapter: 'S3';
	options: IS3AsyncOptions;
};
