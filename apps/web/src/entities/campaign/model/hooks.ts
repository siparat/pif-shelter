import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getCampaigns } from '../api/campaign.api';
import { Campaign } from './types';

export const campaignQueryKeys = {
	root: ['campaigns'] as const,
	list: () => [...campaignQueryKeys.root, 'list'] as const
};

export const useCampaignsQuery = (): UseQueryResult<Campaign[], Error> =>
	useQuery({
		queryKey: campaignQueryKeys.list(),
		queryFn: () => getCampaigns(),
		staleTime: 60 * 1000
	});
