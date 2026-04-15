import { Command } from '@nestjs/cqrs';
import { AcceptInvitationRequestDto } from '../../../../core/dto';

export class AcceptInvitationCommand extends Command<{ userId: string }> {
	constructor(public readonly dto: AcceptInvitationRequestDto) {
		super();
	}
}
