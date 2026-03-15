import { UserRole } from '@pif/shared';

export class GetPostQuery {
	constructor(
		public readonly id: string,
		public readonly userId: string | null,
		public readonly userRole: UserRole | null
	) {}
}
