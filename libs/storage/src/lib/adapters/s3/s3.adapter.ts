import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { StorageService } from '../../storage.service.interface';
import { DEFAULT_SIGNED_URL_EXPIRES_IN, S3_PROVIDE_KEY } from './s3.constants';
import { IS3Provider } from './s3.types';

@Injectable()
export class S3Adapter implements StorageService {
	constructor(@Inject(S3_PROVIDE_KEY) private readonly s3: IS3Provider) {}

	async getPresignedPostData(
		key: string,
		contentType: string,
		maxSize: number,
		expires = 60
	): Promise<{ url: string; fields: Record<string, string>; key: string }> {
		const { url, fields } = await createPresignedPost(this.s3.client, {
			Bucket: this.s3.bucket,
			Key: key,
			Conditions: [
				['content-length-range', 0, maxSize],
				['eq', '$Content-Type', contentType]
			],
			Expires: expires,
			Fields: {
				['Content-Type']: contentType
			}
		});

		return { url, fields, key };
	}

	async getSignedUrl(key: string, expiresInSeconds = DEFAULT_SIGNED_URL_EXPIRES_IN): Promise<string> {
		const command = new GetObjectCommand({ Bucket: this.s3.bucket, Key: key });
		return getSignedUrl(this.s3.client, command, { expiresIn: expiresInSeconds });
	}

	async uploadBuffer(key: string, contentType: string, body: Buffer): Promise<void> {
		await this.s3.client.send(
			new PutObjectCommand({
				Bucket: this.s3.bucket,
				Key: key,
				ContentType: contentType,
				Body: body
			})
		);
	}

	async getObjectBuffer(key: string): Promise<Buffer> {
		const response = await this.s3.client.send(new GetObjectCommand({ Bucket: this.s3.bucket, Key: key }));
		const body = response.Body;
		if (!body) {
			return Buffer.alloc(0);
		}
		const bytes = await body.transformToByteArray();
		return Buffer.from(bytes);
	}

	async delete(key: string): Promise<void> {
		await this.s3.client.send(new DeleteObjectCommand({ Bucket: this.s3.bucket, Key: key }));
	}

	async getMetadata(key: string): Promise<{ contentType?: string; size?: number }> {
		const command = new HeadObjectCommand({ Bucket: this.s3.bucket, Key: key });
		const response = await this.s3.client.send(command);
		return { contentType: response.ContentType, size: response.ContentLength };
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
