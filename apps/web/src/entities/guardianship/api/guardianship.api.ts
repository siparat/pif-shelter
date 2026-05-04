import { api } from '../../../shared/api/base';
import { GuardianshipByAnimal } from '../model/types';

export const getGuardianshipByAnimal = async (animalId: string): Promise<GuardianshipByAnimal | null> => {
	try {
		const body = await api.get(`guardianships/by-animal/${animalId}`).json<{ data: GuardianshipByAnimal }>();
		return body.data;
	} catch (error) {
		const status = (error as { response?: { status?: number } }).response?.status;
		if (status === 404) {
			return null;
		}
		throw error;
	}
};
