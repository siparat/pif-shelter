import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getGuardianshipByAnimal } from '../api/guardianship.api';
import { GuardianshipByAnimal } from './types';

export const guardianshipQueryKeys = {
	root: ['guardianships'] as const,
	byAnimal: (animalId: string) => [...guardianshipQueryKeys.root, 'by-animal', animalId] as const
};

export const useGuardianshipByAnimalQuery = (
	animalId: string | undefined
): UseQueryResult<GuardianshipByAnimal | null, Error> =>
	useQuery({
		queryKey: guardianshipQueryKeys.byAnimal(animalId ?? ''),
		queryFn: () => getGuardianshipByAnimal(animalId as string),
		enabled: !!animalId,
		staleTime: 60 * 1000,
		retry: false
	});
