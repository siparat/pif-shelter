import { Command } from '@nestjs/cqrs';
import { BanContactsRequestDto, BanContactsResponseDto, ReturnDto } from '@pif/contracts';

export class BanContactsCommand extends Command<ReturnDto<typeof BanContactsResponseDto>> {
	constructor(
		public readonly dto: BanContactsRequestDto,
		public readonly moderatorId: string
	) {
		super();
	}
}
