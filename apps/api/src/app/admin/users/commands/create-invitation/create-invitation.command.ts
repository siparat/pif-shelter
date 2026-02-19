import { CreateInvitationRequestDto } from '@pif/contracts';

export class CreateInvitationCommand {
	constructor(public readonly dto: CreateInvitationRequestDto) {}
}
