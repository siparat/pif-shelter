import { CampaignStatus } from '@pif/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	changeCampaignStatus,
	createCampaign,
	deleteCampaign,
	getCampaignById,
	searchCampaigns,
	updateCampaign
} from '../api/campaign.api';
import { campaignKeys } from './query-keys';
import { CampaignListParams, CreateCampaignPayload, UpdateCampaignPayload } from './types';

const invalidateCampaigns = async (queryClient: ReturnType<typeof useQueryClient>): Promise<void> => {
	await queryClient.invalidateQueries({ queryKey: campaignKeys.all });
};

export const useCampaignsList = (params: CampaignListParams, options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: campaignKeys.list(params),
		queryFn: () => searchCampaigns(params),
		enabled: options?.enabled ?? true,
		placeholderData: (prev) => prev
	});

export const useCampaignById = (id: string | null | undefined, options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: campaignKeys.detail(id ?? 'empty'),
		queryFn: () => getCampaignById(id as string),
		enabled: Boolean(id) && (options?.enabled ?? true),
		retry: false
	});

export const useCreateCampaignMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateCampaignPayload) => createCampaign(payload),
		onSuccess: () => invalidateCampaigns(queryClient)
	});
};

export const useUpdateCampaignMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateCampaignPayload }) => updateCampaign(id, payload),
		onSuccess: () => invalidateCampaigns(queryClient)
	});
};

export const useChangeCampaignStatusMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: CampaignStatus }) => changeCampaignStatus(id, status),
		onSuccess: () => invalidateCampaigns(queryClient)
	});
};

export const useDeleteCampaignMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteCampaign(id),
		onSuccess: () => invalidateCampaigns(queryClient)
	});
};
