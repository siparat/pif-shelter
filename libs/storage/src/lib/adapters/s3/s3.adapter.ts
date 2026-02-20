import { DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { Inject, Injectable } from '@nestjs/common';
import { StorageService } from '../../storage.service.interface';
import { S3_PROVIDE_KEY } from './s3.constants';
import { IS3Provider } from './s3.types';

@Injectable()
export class S3Adapter implements StorageService {
	constructor(@Inject(S3_PROVIDE_KEY) private readonly s3: IS3Provider) {}

	async getPresignedPostData(
		key: string,
		contentType: string,
		maxSize: number
	): Promise<{ url: string; fields: Record<string, string>; key: string }> {
		const { url, fields } = await createPresignedPost(this.s3.client, {
			Bucket: this.s3.bucket,
			Key: key,
			Conditions: [
				['content-length-range', 0, maxSize],
				['eq', '$Content-Type', contentType]
			],
			Expires: 60,
			Fields: {
				['Content-Type']: contentType
			}
		});

		return { url, fields, key };
	}

	async delete(key: string): Promise<void> {
		await this.s3.client.send(new DeleteObjectCommand({ Bucket: this.s3.bucket, Key: key }));
	}

	async checkIfExists(key: string): Promise<boolean> {
		try {
			await this.s3.client.send(new HeadObjectCommand({ Bucket: this.s3.bucket, Key: key }));
			return true;
		} catch {
			return false;
		}
	}
}
