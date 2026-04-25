import { Query } from '@nestjs/cqrs';
import { ListTeamUsersResult } from '@pif/contracts';

export class ListTeamUsersQuery extends Query<ListTeamUsersResult['data']> {
	constructor(public readonly includeGuardians = false) {
		super();
	}
}
