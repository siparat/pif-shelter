import {
	approveContactsResponseSchema,
	banContactsRequestSchema,
	banContactsResponseSchema,
	deleteContactFromBlacklistResponseSchema,
	listBlacklistResponseSchema,
	suspectContactsRequestSchema,
	suspectContactsResponseSchema
} from '@pif/contracts';
import { z } from 'zod';
import { api } from '../../../shared/api';
import {
	ApproveContactsResult,
	BanContactsPayload,
	BanContactsResult,
	BlacklistListData,
	BlacklistListParams,
	DeleteContactResult,
	SuspectContactsPayload,
	SuspectContactsResult
} from '../model/types';

const buildSearchParams = (params: BlacklistListParams): Record<string, string> => {
	const parsed = z
		.object({
			page: z.number().optional(),
			perPage: z.number().optional(),
			sort: z.string().optional(),
			status: z.string().optional(),
			source: z.string().optional()
		})
		.parse(params);
	const rawEntries = Object.entries(parsed).filter(
		([, value]) => value !== undefined && value !== null && value !== ''
	);
	return Object.fromEntries(rawEntries.map(([key, value]) => [key, String(value)]));
};

export const getBlacklist = async (params: BlacklistListParams): Promise<BlacklistListData> => {
	const response = await api.get('blacklist', { searchParams: buildSearchParams(params) }).json<unknown>();
	return listBlacklistResponseSchema.parse({ success: true, ...response });
};

export const banContacts = async (payload: BanContactsPayload): Promise<BanContactsResult> => {
	const body = banContactsRequestSchema.parse(payload);
	const response = await api.post('blacklist/ban', { json: body }).json<unknown>();
	return banContactsResponseSchema.parse(response).data;
};

export const suspectContacts = async (payload: SuspectContactsPayload): Promise<SuspectContactsResult> => {
	const body = suspectContactsRequestSchema.parse(payload);
	const response = await api.post('blacklist/suspect', { json: body }).json<unknown>();
	return suspectContactsResponseSchema.parse(response).data;
};

export const approveContacts = async (sources: BanContactsPayload['sources']): Promise<ApproveContactsResult> => {
	const response = await api.post('blacklist/approve', { json: { sources } }).json<unknown>();
	return approveContactsResponseSchema.parse(response).data;
};

export const deleteBlacklistEntry = async (id: string): Promise<DeleteContactResult> => {
	const response = await api.delete(`blacklist/${id}`).json<unknown>();
	return deleteContactFromBlacklistResponseSchema.parse(response).data;
};
