import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';
import { CampaignUpdatedEvent } from '../../events/campaign-updated/campaign-updated.event';
import { CampaignNotFoundException } from '../../exceptions/campaign-not-found.exception';
import { CanCreateCampaignPolicy } from '../../policies/can-create-campaign.policy';
import { CampaignsRepository } from '../../repositories/campaigns.repository';
import { UpdateCampaignCommand } from './update-campaign.command';

@CommandHandler(UpdateCampaignCommand)
export class UpdateCampaignHandler implements ICommandHandler<UpdateCampaignCommand> {
	constructor(
		private readonly repository: CampaignsRepository,
		private readonly policy: CanCreateCampaignPolicy,
		private readonly storagePolicy: FileStoragePolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ id, dto, userId }: UpdateCampaignCommand): Promise<{ id: string }> {
		const campaign = await this.repository.findById(id);
		if (!campaign) {
			throw new CampaignNotFoundException();
		}
		await this.policy.assertCanUpdate(campaign, dto);
		if (dto.previewImage) {
			await this.storagePolicy.assertExists(dto.previewImage);
		}
		const updated = await this.repository.update(id, dto);
		if (!updated) {
			throw new CampaignNotFoundException();
		}
		this.eventBus.publish(new CampaignUpdatedEvent(updated));
		this.logger.log('Срочный сбор обновлён', { id, userId, animalId: dto.animalId });

		return { id };
	}
}
