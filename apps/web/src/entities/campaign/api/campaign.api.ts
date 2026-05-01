import { searchCampaignsResponseSchema } from '@pif/contracts';
import { CampaignStatus } from '@pif/shared';
import { z } from 'zod';
import { api } from '../../../shared/api/base';
import { Campaign } from '../model/types';

const CAMPAIGNS_PER_PAGE = 12;

const searchCampaignsParamsSchema = z.object({
	page: z.number().int().min(1).default(1),
	perPage: z.number().int().min(1).max(100).default(CAMPAIGNS_PER_PAGE),
	status: z.enum(CampaignStatus).optional()
});

export const getCampaigns = async (params?: {
	page?: number;
	perPage?: number;
	status?: CampaignStatus;
}): Promise<Campaign[]> => {
	const query = searchCampaignsParamsSchema.parse({
		page: params?.page ?? 1,
		perPage: params?.perPage ?? CAMPAIGNS_PER_PAGE,
		status: params?.status ?? CampaignStatus.PUBLISHED
	});
	const body = await api
		.get('campaigns', {
			searchParams: {
				page: String(query.page),
				perPage: String(query.perPage),
				status: query.status
			}
		})
		.json();
	const parsed = searchCampaignsResponseSchema.parse(body);
	return parsed.data;
};
