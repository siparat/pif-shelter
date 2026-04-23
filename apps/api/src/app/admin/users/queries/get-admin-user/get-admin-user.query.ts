import { Query } from '@nestjs/cqrs';
import { GetAdminUserResult } from '@pif/contracts';

export class GetAdminUserQuery extends Query<GetAdminUserResult['data']> {
	constructor(public readonly userId: string) {
		super();
	}
}
