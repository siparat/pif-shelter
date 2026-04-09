import { Command } from '@nestjs/cqrs';
import { DeleteContactFromBlacklistResponseDto, ReturnDto } from '@pif/contracts';

export class DeleteContactFromBlacklistCommand extends Command<
	ReturnDto<typeof DeleteContactFromBlacklistResponseDto>
> {
	constructor(
		public readonly id: string,
		public readonly moderatorId: string
	) {
		super();
	}
}
