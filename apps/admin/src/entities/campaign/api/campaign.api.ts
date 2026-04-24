import {
	createCampaignResponseSchema,
	getCampaignByIdResponseSchema,
	searchCampaignsResponseSchema,
	updateCampaignResponseSchema
} from '@pif/contracts';
import { CampaignStatus } from '@pif/shared';
import { z } from 'zod';
import { api } from '../../../shared/api';
import {
	CampaignDetails,
	CampaignListData,
	CampaignListParams,
	CreateCampaignPayload,
	CreateCampaignResult,
	UpdateCampaignPayload,
	UpdateCampaignResult
} from '../model/types';

const buildSearchParams = (params: CampaignListParams): Record<string, string> => {
	const rawEntries = Object.entries(params).filter(
		([, value]) => value !== undefined && value !== null && value !== ''
	);
	return Object.fromEntries(rawEntries.map(([key, value]) => [key, String(value)]));
};

type SearchCampaignsResult = z.infer<typeof searchCampaignsResponseSchema>;
type GetCampaignByIdResult = z.infer<typeof getCampaignByIdResponseSchema>;
type CreateCampaignApiResult = z.infer<typeof createCampaignResponseSchema>;
type UpdateCampaignApiResult = z.infer<typeof updateCampaignResponseSchema>;

export const searchCampaigns = async (params: CampaignListParams): Promise<CampaignListData> => {
	return api.get('campaigns', { searchParams: buildSearchParams(params) }).json<SearchCampaignsResult>();
};

export const getCampaignById = async (id: string): Promise<CampaignDetails> => {
	const response = await api.get(`campaigns/${id}`).json<GetCampaignByIdResult>();
	return response.data;
};

export const createCampaign = async (payload: CreateCampaignPayload): Promise<CreateCampaignResult> => {
	const response = await api.post('campaigns', { json: payload }).json<CreateCampaignApiResult>();
	return response.data;
};

export const updateCampaign = async (id: string, payload: UpdateCampaignPayload): Promise<UpdateCampaignResult> => {
	const response = await api.patch(`campaigns/${id}`, { json: payload }).json<UpdateCampaignApiResult>();
	return response.data;
};

const statusEndpointByValue: Record<CampaignStatus, string> = {
	[CampaignStatus.DRAFT]: 'draft',
	[CampaignStatus.PUBLISHED]: 'publish',
	[CampaignStatus.CANCELLED]: 'cancel',
	[CampaignStatus.SUCCESS]: 'success',
	[CampaignStatus.FAILED]: 'fail'
};

export const changeCampaignStatus = async (id: string, status: CampaignStatus): Promise<UpdateCampaignResult> => {
	const endpoint = statusEndpointByValue[status];
	const response = await api.patch(`campaigns/${id}/${endpoint}`).json<UpdateCampaignApiResult>();
	return response.data;
};

export const deleteCampaign = async (id: string): Promise<void> => {
	await api.delete(`campaigns/${id}`);
};
