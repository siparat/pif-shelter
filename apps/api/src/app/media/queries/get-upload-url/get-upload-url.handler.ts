import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUploadUrlResponseDto, ReturnDto } from '@pif/contracts';
import { StorageService } from '@pif/storage';
import { randomUUID } from 'crypto';
import { GetUploadUrlQuery } from './get-upload-url.query';

@QueryHandler(GetUploadUrlQuery)
export class GetUploadUrlHandler implements IQueryHandler<GetUploadUrlQuery> {
	constructor(private readonly storage: StorageService) {}

	async execute(query: GetUploadUrlQuery): Promise<ReturnDto<typeof GetUploadUrlResponseDto>> {
		const { type } = query.dto;
		const key = `${type}/${randomUUID()}.webp`;
		const contentType = 'image/webp';
		const maxSize = this.getMaxSizeForType(type);

		const result = await this.storage.getPresignedPostData(key, contentType, maxSize);

		return {
			url: result.url,
			fields: result.fields,
			key: result.key
		};
	}

	private getMaxSizeForType(type: GetUploadUrlQuery['dto']['type']): number {
		switch (type) {
			case 'animals':
				return 5 * 1024 * 1024;
			case 'users':
				return 2 * 1024 * 1024;
			default:
				return 2 * 1024 * 1024;
		}
	}
}
