import { CampaignListParams } from './types';

export const campaignKeys = {
	all: ['campaigns'] as const,
	list: (params: CampaignListParams) => [...campaignKeys.all, 'list', params] as const,
	detail: (id: string) => [...campaignKeys.all, 'detail', id] as const
};
