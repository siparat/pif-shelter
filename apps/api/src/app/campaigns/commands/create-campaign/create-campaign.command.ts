import { Command } from '@nestjs/cqrs';
import { CreateCampaignRequestDto } from '../../../core/dto';

export class CreateCampaignCommand extends Command<{ id: string }> {
	constructor(
		public readonly dto: CreateCampaignRequestDto,
		public readonly userId: string
	) {
		super();
	}
}
