import { GetGuardianProfileResult, ListGuardianReportsResult } from '@pif/contracts';
import { api } from '../../../shared/api';
import { GuardianProfileData, GuardianReportsPage } from '../model/types';

export const getGuardianProfile = async (userId: string): Promise<GuardianProfileData> => {
	const response = await api.get(`guardianships/guardian/${userId}`).json<GetGuardianProfileResult>();
	return response.data;
};

export interface GuardianReportsQuery {
	userId: string;
	page: number;
	perPage: number;
}

export const getGuardianReports = async ({
	userId,
	page,
	perPage
}: GuardianReportsQuery): Promise<GuardianReportsPage> => {
	const response = await api
		.get(`guardianships/guardian/${userId}/reports`, {
			searchParams: { page: String(page), perPage: String(perPage) }
		})
		.json<ListGuardianReportsResult>();
	return { data: response.data, meta: response.meta };
};
