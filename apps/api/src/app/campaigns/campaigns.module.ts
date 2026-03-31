import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AnimalsModule } from '../animals/animals.module';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { ChangeCampaignStatusHandler } from './commands/change-campaign-status/change-campaign-status.handler';
import { CreateCampaignHandler } from './commands/create-campaign/create-campaign.handler';
import { DeleteCampaignHandler } from './commands/delete-campaign/delete-campaign.handler';
import { UpdateCampaignHandler } from './commands/update-campaign/update-campaign.handler';
import { CampaignDeletedHandler } from './events/campaign-deleted/campaign-deleted.handler';
import { CanCreateCampaignPolicy } from './policies/can-create-campaign.policy';
import { CampaignsRepository } from './repositories/campaigns.repository';
import { DrizzleCampaignsRepository } from './repositories/drizzle-campaigns.repository';
import { GetCampaignByIdHandler } from './queries/get-campaign-by-id/get-campaign-by-id.handler';
import { CampaignCreatedHandler } from './events/campaign-created/campaign-created.handler';
import { CampaignUpdatedHandler } from './events/campaign-updated/campaign-updated.handler';

@Module({
	imports: [CqrsModule, AnimalsModule],
	controllers: [CampaignsController],
	exports: [CampaignsService],
	providers: [
		CampaignsService,
		CanCreateCampaignPolicy,
		CreateCampaignHandler,
		ChangeCampaignStatusHandler,
		UpdateCampaignHandler,
		DeleteCampaignHandler,
		GetCampaignByIdHandler,
		CampaignCreatedHandler,
		CampaignUpdatedHandler,
		CampaignDeletedHandler,
		{
			provide: CampaignsRepository,
			useClass: DrizzleCampaignsRepository
		}
	]
})
export class CampaignsModule {}
