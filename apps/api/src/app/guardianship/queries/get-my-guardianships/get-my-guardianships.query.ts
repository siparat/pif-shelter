import { Query } from '@nestjs/cqrs';
import { GetMyGaurdianshipsResponseDto, ReturnDto } from '@pif/contracts';

export class GetMyGaurdianshipsQuery extends Query<ReturnDto<typeof GetMyGaurdianshipsResponseDto>> {
	constructor(public readonly userId: string) {
		super();
	}
}
