import { GetGuardianProfileResult } from '@pif/contracts';
import { api } from '../../../shared/api';
import { GuardianProfileData } from '../model/types';

export const getGuardianProfile = async (userId: string): Promise<GuardianProfileData> => {
	const response = await api.get(`guardianships/guardian/${userId}`).json<GetGuardianProfileResult>();
	return response.data;
};
