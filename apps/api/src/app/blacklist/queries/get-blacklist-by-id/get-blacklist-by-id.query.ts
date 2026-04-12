import { GetBlacklistByIdResponseDto, ReturnDto } from '@pif/contracts';
import { Query } from '@nestjs/cqrs';

export class GetBlacklistByIdQuery extends Query<ReturnDto<typeof GetBlacklistByIdResponseDto>> {
	constructor(public readonly id: string) {
		super();
	}
}
