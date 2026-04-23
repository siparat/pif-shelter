import { Query } from '@nestjs/cqrs';
import { GetGuardianProfileResult, ReturnData } from '@pif/contracts';

export class GetGuardianProfileQuery extends Query<ReturnData<GetGuardianProfileResult>> {
	constructor(
		public readonly userId: string,
		public readonly curatorFilterId: string | null
	) {
		super();
	}
}
