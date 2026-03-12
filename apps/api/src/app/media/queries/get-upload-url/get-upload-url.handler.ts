import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUploadUrlResponseDto, ReturnDto } from '@pif/contracts';
import { IMAGE_MIME_TYPES, VIDEO_MIME_TYPES } from '@pif/shared';
import { StorageService } from '@pif/storage';
import { randomUUID } from 'crypto';
import { GetUploadUrlQuery } from './get-upload-url.query';

@QueryHandler(GetUploadUrlQuery)
export class GetUploadUrlHandler implements IQueryHandler<GetUploadUrlQuery> {
	constructor(private readonly storage: StorageService) {}

	async execute({
		dto: { ext, type, space }
	}: GetUploadUrlQuery): Promise<ReturnDto<typeof GetUploadUrlResponseDto>> {
		const key = `${space}/${randomUUID()}.${ext}`;
		const contentType = type === 'image' ? IMAGE_MIME_TYPES[ext] : VIDEO_MIME_TYPES[ext];
		const maxSize = this.getMaxSizeForType(space, type);

		const expires = type == 'image' ? 60 : 300;

		const result = await this.storage.getPresignedPostData(key, contentType, maxSize, expires);

		return {
			url: result.url,
			fields: result.fields,
			key: result.key
		};
	}

	private getMaxSizeForType(
		space: GetUploadUrlQuery['dto']['space'],
		type: GetUploadUrlQuery['dto']['type']
	): number {
		switch (type) {
			case 'video': {
				return 512 * 1024 * 1024;
			}
			case 'image': {
				switch (space) {
					case 'animals':
						return 5 * 1024 * 1024;
					case 'users':
						return 2 * 1024 * 1024;
					default:
						return 2 * 1024 * 1024;
				}
			}
		}
	}
}
