import { ApiSuccessResponse } from '@pif/contracts';
import { api } from '../../../shared/api';
import {
	CancelGuardianshipPayload,
	GuardianshipDetails,
	GuardianshipsListData,
	GuardianshipsListParams
} from '../model/types';

const buildSearchParams = (params: GuardianshipsListParams): Record<string, string> => {
	const rawEntries = Object.entries(params).filter(
		([, value]) => value !== undefined && value !== null && value !== ''
	);
	return Object.fromEntries(rawEntries.map(([key, value]) => [key, String(value)]));
};

export const getGuardianships = async (params: GuardianshipsListParams): Promise<GuardianshipsListData> => {
	return api.get('guardianships', { searchParams: buildSearchParams(params) }).json<GuardianshipsListData>();
};

export const getGuardianshipByAnimal = async (animalId: string): Promise<GuardianshipDetails> => {
	return (await api.get(`guardianships/by-animal/${animalId}`).json<ApiSuccessResponse<GuardianshipDetails>>()).data;
};

export const cancelGuardianship = async (payload: CancelGuardianshipPayload): Promise<{ guardianshipId: string }> => {
	const response = await api
		.post('guardianships/cancel', { json: payload })
		.json<ApiSuccessResponse<{ guardianshipId: string }>>();
	return response.data;
};
