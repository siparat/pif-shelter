import { SuspectContactsRequestDto } from '@pif/contracts';

export class ContactsSuspectedEvent {
	constructor(
		public readonly dto: SuspectContactsRequestDto,
		public readonly moderatorId: string
	) {}
}
