import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
	ALLOW_IMAGE_EXT,
	DEFAULT_IMAGE_MAX_BYTES,
	IMAGE_MIME_TYPES,
	PRESIGNED_EXPIRES_SECONDS,
	UPLOAD_MAX_BYTES,
	VIDEO_MIME_TYPES
} from '@pif/shared';
import { StorageService } from '@pif/storage';
import { randomUUID } from 'crypto';
import { GetUploadUrlResponseDto, ReturnData } from '../../../core/dto';
import { GetUploadUrlQuery } from './get-upload-url.query';

@QueryHandler(GetUploadUrlQuery)
export class GetUploadUrlHandler implements IQueryHandler<GetUploadUrlQuery> {
	constructor(private readonly storage: StorageService) {}

	async execute({
		dto: { ext, type, space }
	}: GetUploadUrlQuery): Promise<ReturnData<typeof GetUploadUrlResponseDto>> {
		const key = `${space}/${randomUUID()}.${ext}`;
		const contentType =
			type === 'image' ? IMAGE_MIME_TYPES[ext as (typeof ALLOW_IMAGE_EXT)[number]] : VIDEO_MIME_TYPES[ext];
		const maxSize = UPLOAD_MAX_BYTES[space][type] ?? DEFAULT_IMAGE_MAX_BYTES;
		const expires = PRESIGNED_EXPIRES_SECONDS[type];

		const result = await this.storage.getPresignedPostData(key, contentType, maxSize, expires);

		return {
			url: result.url,
			fields: result.fields,
			key: result.key
		};
	}
}
