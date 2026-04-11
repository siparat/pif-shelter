import { ApproveContactsRequestDto } from '@pif/contracts';

export class ContactsApprovedEvent {
	constructor(
		public readonly dto: ApproveContactsRequestDto,
		public readonly moderatorId: string
	) {}
}
