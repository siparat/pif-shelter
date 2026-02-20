import { Invitation } from '@pif/database';

export class InvitationCreatedEvent {
	constructor(public readonly invitation: Invitation) {}
}
