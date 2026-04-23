import { Query } from '@nestjs/cqrs';
import { ListGuardianshipsResult } from '@pif/contracts';
import { ListGuardianshipsRequestDto } from '../../../core/dto';

export class ListGuardianshipsQuery extends Query<ListGuardianshipsResult> {
	constructor(public readonly dto: ListGuardianshipsRequestDto) {
		super();
	}
}
