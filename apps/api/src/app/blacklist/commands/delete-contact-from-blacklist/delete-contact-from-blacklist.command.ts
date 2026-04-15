import { Command } from '@nestjs/cqrs';
import { DeleteContactFromBlacklistResponseDto, ReturnData } from '../../../core/dto';

export class DeleteContactFromBlacklistCommand extends Command<
	ReturnData<typeof DeleteContactFromBlacklistResponseDto>
> {
	constructor(
		public readonly id: string,
		public readonly moderatorId: string
	) {
		super();
	}
}
