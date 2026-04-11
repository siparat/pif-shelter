import { Command } from '@nestjs/cqrs';
import { ApproveContactsRequestDto, ApproveContactsResponseDto, ReturnDto } from '@pif/contracts';

export class ApproveContactsCommand extends Command<ReturnDto<typeof ApproveContactsResponseDto>> {
	constructor(
		public readonly dto: ApproveContactsRequestDto,
		public readonly moderatorId: string
	) {
		super();
	}
}
