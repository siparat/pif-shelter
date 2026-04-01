import { Command } from '@nestjs/cqrs';
import { CampaignStatus } from '@pif/shared';

export class ChangeCampaignStatusCommand extends Command<{ id: string }> {
	constructor(
		public readonly id: string,
		public readonly status: CampaignStatus,
		public readonly userId: string
	) {
		super();
	}
}
