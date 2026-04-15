import { CreateMeetingRequestDto } from '../../../core/dto';

export class CreateMeetingRequestCommand {
	constructor(public readonly dto: CreateMeetingRequestDto) {}
}
