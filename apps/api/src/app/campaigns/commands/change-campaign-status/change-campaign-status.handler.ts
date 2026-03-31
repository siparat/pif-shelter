import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { CampaignUpdatedEvent } from '../../events/campaign-updated/campaign-updated.event';
import { CampaignNotFoundException } from '../../exceptions/campaign-not-found.exception';
import { CanCreateCampaignPolicy } from '../../policies/can-create-campaign.policy';
import { CampaignsRepository } from '../../repositories/campaigns.repository';
import { ChangeCampaignStatusCommand } from './change-campaign-status.command';

@CommandHandler(ChangeCampaignStatusCommand)
export class ChangeCampaignStatusHandler implements ICommandHandler<ChangeCampaignStatusCommand> {
	constructor(
		private readonly repository: CampaignsRepository,
		private readonly policy: CanCreateCampaignPolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ id, status, userId }: ChangeCampaignStatusCommand): Promise<{ id: string }> {
		const campaign = await this.repository.findById(id);
		if (!campaign) {
			throw new CampaignNotFoundException();
		}
		this.policy.assertCanChangeStatus(campaign, status);
		if (campaign.status === status) {
			return { id };
		}
		const updated = await this.repository.updateStatus(id, status);
		if (!updated) {
			throw new CampaignNotFoundException();
		}
		this.eventBus.publish(new CampaignUpdatedEvent(updated));
		this.logger.log('Статус срочного сбора обновлён', { id, status, userId });

		return { id };
	}
}
