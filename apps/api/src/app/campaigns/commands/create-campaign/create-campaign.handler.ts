import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';
import { CampaignCreatedEvent } from '../../events/campaign-created/campaign-created.event';
import { CanCreateCampaignPolicy } from '../../policies/can-create-campaign.policy';
import { CampaignsRepository } from '../../repositories/campaigns.repository';
import { CreateCampaignCommand } from './create-campaign.command';

@CommandHandler(CreateCampaignCommand)
export class CreateCampaignHandler implements ICommandHandler<CreateCampaignCommand> {
	constructor(
		private readonly repository: CampaignsRepository,
		private readonly policy: CanCreateCampaignPolicy,
		private readonly storagePolicy: FileStoragePolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ dto, userId }: CreateCampaignCommand): Promise<{ id: string }> {
		await this.policy.assertCanCreate(dto);
		if (dto.previewImage) {
			await this.storagePolicy.assertExists(dto.previewImage);
		}

		const campaign = await this.repository.create(dto);

		this.eventBus.publish(new CampaignCreatedEvent(campaign));

		this.logger.log('Срочный сбор создан', {
			id: campaign.id,
			title: dto.title,
			userId,
			animalId: dto.animalId
		});

		return { id: campaign.id };
	}
}
