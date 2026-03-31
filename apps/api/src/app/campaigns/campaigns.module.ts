import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AnimalsModule } from '../animals/animals.module';
import { CampaignsController } from './campaigns.controller';
import { CreateCampaignHandler } from './commands/create-campaign/create-campaign.handler';
import { CanCreateCampaignPolicy } from './policies/can-create-campaign.policy';
import { CampaignsRepository } from './repositories/campaigns.repository';
import { DrizzleCampaignsRepository } from './repositories/drizzle-campaigns.repository';
import { GetCampaignByIdHandler } from './queries/get-campaign-by-id/get-campaign-by-id.handler';
import { CampaignCreatedHandler } from './events/campaign-created/campaign-created.handler';

@Module({
	imports: [CqrsModule, AnimalsModule],
	controllers: [CampaignsController],
	providers: [
		CanCreateCampaignPolicy,
		CreateCampaignHandler,
		GetCampaignByIdHandler,
		CampaignCreatedHandler,
		{
			provide: CampaignsRepository,
			useClass: DrizzleCampaignsRepository
		}
	]
})
export class CampaignsModule {}
