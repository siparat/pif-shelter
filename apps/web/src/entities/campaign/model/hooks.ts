import { CampaignStatus } from '@pif/shared';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getCampaigns } from '../api/campaign.api';
import { Campaign } from './types';

export const campaignQueryKeys = {
	root: ['campaigns'] as const,
	list: (status?: CampaignStatus) => [...campaignQueryKeys.root, 'list', status ?? 'all'] as const
};

export const useCampaignsQuery = (): UseQueryResult<Campaign[], Error> =>
	useQuery({
		queryKey: campaignQueryKeys.list(),
		queryFn: () => getCampaigns(),
		staleTime: 60 * 1000
	});

export const useCompletedCampaignsQuery = (): UseQueryResult<Campaign[], Error> =>
	useQuery({
		queryKey: campaignQueryKeys.list(CampaignStatus.SUCCESS),
		queryFn: () => getCampaigns({ status: CampaignStatus.SUCCESS }),
		staleTime: 5 * 60 * 1000
	});
