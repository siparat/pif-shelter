import { Query } from '@nestjs/cqrs';
import { GetUploadUrlRequestDto, GetUploadUrlResponseDto, ReturnDto } from '@pif/contracts';

export class GetUploadUrlQuery extends Query<ReturnDto<typeof GetUploadUrlResponseDto>> {
	constructor(public readonly dto: GetUploadUrlRequestDto) {
		super();
	}
}
