import { Command } from '@nestjs/cqrs';
import { CreateInvitationRequestDto } from '@pif/contracts';

export class CreateInvitationCommand extends Command<{ invitationId: string }> {
	constructor(public readonly dto: CreateInvitationRequestDto) {
		super();
	}
}
