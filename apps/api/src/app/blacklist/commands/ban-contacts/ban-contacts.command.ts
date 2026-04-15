import { Command } from '@nestjs/cqrs';
import { BanContactsRequestDto, BanContactsResponseDto, ReturnData } from '../../../core/dto';

export class BanContactsCommand extends Command<ReturnData<typeof BanContactsResponseDto>> {
	constructor(
		public readonly dto: BanContactsRequestDto,
		public readonly moderatorId: string
	) {
		super();
	}
}
