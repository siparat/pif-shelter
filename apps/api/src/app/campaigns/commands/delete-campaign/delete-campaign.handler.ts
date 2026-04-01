import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { CampaignDeletedEvent } from '../../events/campaign-deleted/campaign-deleted.event';
import { CampaignsRepository } from '../../repositories/campaigns.repository';
import { DeleteCampaignCommand } from './delete-campaign.command';

@CommandHandler(DeleteCampaignCommand)
export class DeleteCampaignHandler implements ICommandHandler<DeleteCampaignCommand> {
	constructor(
		private readonly repository: CampaignsRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ id, userId }: DeleteCampaignCommand): Promise<void> {
		const campaign = await this.repository.findById(id);
		if (!campaign) {
			return;
		}
		const isDeleted = await this.repository.delete(id);
		if (!isDeleted) {
			return;
		}
		this.eventBus.publish(new CampaignDeletedEvent(id));
		this.logger.log('Срочный сбор удалён', { id, userId });
	}
}
