import { Query } from '@nestjs/cqrs';
import { GetMyGaurdianshipsResponseDto, ReturnData } from '../../../core/dto';

export class GetMyGaurdianshipsQuery extends Query<ReturnData<typeof GetMyGaurdianshipsResponseDto>> {
	constructor(public readonly userId: string) {
		super();
	}
}
