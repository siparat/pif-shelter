import { AcceptInvitationRequestDto } from '@pif/contracts';
import { Invitation } from '@pif/database';

export class InvitationAcceptedEvent {
	constructor(
		public readonly invitation: Invitation,
		public readonly dto: AcceptInvitationRequestDto,
		public readonly userId: string
	) {}
}
