import { guardianships } from '@pif/database';

export class GuardianshipCancelledEvent {
	constructor(
		public readonly guardianship: typeof guardianships.$inferSelect,
		public readonly isRefundExpected: boolean,
		public readonly reason?: string
	) {}
}
