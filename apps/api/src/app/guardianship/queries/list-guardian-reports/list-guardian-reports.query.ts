import { Query } from '@nestjs/cqrs';
import { ListGuardianReportsResult } from '@pif/contracts';

export class ListGuardianReportsQuery extends Query<ListGuardianReportsResult> {
	constructor(
		public readonly userId: string,
		public readonly page: number,
		public readonly perPage: number,
		public readonly curatorFilterId: string | null = null
	) {
		super();
	}
}
