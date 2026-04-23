import { GuardianshipsListParams } from './types';

export const guardianshipsKeys = {
	all: ['guardianships'] as const,
	list: (params: GuardianshipsListParams) => [...guardianshipsKeys.all, 'list', params] as const,
	byAnimal: (animalId: string) => [...guardianshipsKeys.all, 'by-animal', animalId] as const
};
