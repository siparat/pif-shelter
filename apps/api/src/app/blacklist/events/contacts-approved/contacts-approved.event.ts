import { ApproveContactsRequestDto } from '../../../core/dto';

export class ContactsApprovedEvent {
	constructor(
		public readonly dto: ApproveContactsRequestDto,
		public readonly moderatorId: string
	) {}
}
