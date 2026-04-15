import { Command } from '@nestjs/cqrs';
import { ReturnData, SuspectContactsRequestDto, SuspectContactsResponseDto } from '../../../core/dto';

export class SuspectContactsCommand extends Command<ReturnData<typeof SuspectContactsResponseDto>> {
	constructor(
		public readonly dto: SuspectContactsRequestDto,
		public readonly moderatorId: string
	) {
		super();
	}
}
