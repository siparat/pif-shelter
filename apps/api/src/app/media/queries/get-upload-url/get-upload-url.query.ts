import { Query } from '@nestjs/cqrs';
import { GetUploadUrlRequestDto, GetUploadUrlResponseDto, ReturnData } from '../../../core/dto';

export class GetUploadUrlQuery extends Query<ReturnData<typeof GetUploadUrlResponseDto>> {
	constructor(public readonly dto: GetUploadUrlRequestDto) {
		super();
	}
}
