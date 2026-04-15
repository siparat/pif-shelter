import { Invitation } from '@pif/database';
import { AcceptInvitationRequestDto } from '../../../../core/dto';

export class InvitationAcceptedEvent {
	constructor(
		public readonly invitation: Invitation,
		public readonly dto: AcceptInvitationRequestDto,
		public readonly userId: string
	) {}
}
