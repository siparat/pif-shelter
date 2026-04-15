import { Query } from '@nestjs/cqrs';
import { GetBlacklistByIdResponseDto, ReturnData } from '../../../core/dto';

export class GetBlacklistByIdQuery extends Query<ReturnData<typeof GetBlacklistByIdResponseDto>> {
	constructor(public readonly id: string) {
		super();
	}
}
