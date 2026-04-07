import { CreateMeetingRequestDto } from '@pif/contracts';

export class CreateMeetingRequestCommand {
	constructor(public readonly dto: CreateMeetingRequestDto) {}
}
