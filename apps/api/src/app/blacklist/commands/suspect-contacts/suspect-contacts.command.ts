import { Command } from '@nestjs/cqrs';
import { ReturnDto, SuspectContactsRequestDto, SuspectContactsResponseDto } from '@pif/contracts';

export class SuspectContactsCommand extends Command<ReturnDto<typeof SuspectContactsResponseDto>> {
	constructor(
		public readonly dto: SuspectContactsRequestDto,
		public readonly moderatorId: string
	) {
		super();
	}
}
