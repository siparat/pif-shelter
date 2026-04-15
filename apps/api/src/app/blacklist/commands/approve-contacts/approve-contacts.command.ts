import { Command } from '@nestjs/cqrs';
import { ApproveContactsRequestDto, ApproveContactsResponseDto, ReturnData } from '../../../core/dto';

export class ApproveContactsCommand extends Command<ReturnData<typeof ApproveContactsResponseDto>> {
	constructor(
		public readonly dto: ApproveContactsRequestDto,
		public readonly moderatorId: string
	) {
		super();
	}
}
