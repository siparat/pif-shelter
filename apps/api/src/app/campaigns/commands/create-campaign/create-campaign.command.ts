import { Command } from '@nestjs/cqrs';
import { CreateCampaignRequestDto } from '@pif/contracts';

export class CreateCampaignCommand extends Command<{ id: string }> {
	constructor(
		public readonly dto: CreateCampaignRequestDto,
		public readonly userId: string
	) {
		super();
	}
}
