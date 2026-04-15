import { Query } from '@nestjs/cqrs';
import { SearchCampaignsRequestDto, SearchCampaignsResponseDto } from '../../../core/dto';

export type CampaingsSearchResult = Omit<SearchCampaignsResponseDto, 'success'>;

export class SearchCampaignsQuery extends Query<CampaingsSearchResult> {
	constructor(public readonly dto: SearchCampaignsRequestDto) {
		super();
	}
}
