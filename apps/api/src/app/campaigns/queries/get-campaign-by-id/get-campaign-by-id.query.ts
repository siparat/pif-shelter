import { Query } from '@nestjs/cqrs';
import { CampaignResponse } from '@pif/contracts';

export type CampaignDetails = CampaignResponse;

export class GetCampaignByIdQuery extends Query<CampaignDetails> {
	constructor(public readonly id: string) {
		super();
	}
}
