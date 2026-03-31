import { Command } from '@nestjs/cqrs';
import { UpdateCampaignRequestDto } from '@pif/contracts';

export class UpdateCampaignCommand extends Command<{ id: string }> {
	constructor(
		public readonly id: string,
		public readonly dto: UpdateCampaignRequestDto,
		public readonly userId: string
	) {
		super();
	}
}
