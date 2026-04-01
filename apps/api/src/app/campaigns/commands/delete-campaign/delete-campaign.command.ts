import { Command } from '@nestjs/cqrs';

export class DeleteCampaignCommand extends Command<void> {
	constructor(
		public readonly id: string,
		public readonly userId: string
	) {
		super();
	}
}
