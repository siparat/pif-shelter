import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { animalsKeys } from '../../animal/model/query-keys';
import { cancelGuardianship, getGuardianshipByAnimal, getGuardianships } from '../api/guardianships.api';
import { guardianshipsKeys } from './query-keys';
import { CancelGuardianshipPayload, GuardianshipsListParams } from './types';

export const useGuardianshipsList = (params: GuardianshipsListParams, options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: guardianshipsKeys.list(params),
		queryFn: () => getGuardianships(params),
		placeholderData: (prev) => prev,
		enabled: options?.enabled ?? true
	});

export const useGuardianshipByAnimal = (animalId: string | null | undefined, options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: guardianshipsKeys.byAnimal(animalId ?? 'empty'),
		queryFn: () => getGuardianshipByAnimal(animalId as string),
		enabled: Boolean(animalId) && (options?.enabled ?? true),
		retry: false
	});

export const useCancelGuardianshipMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CancelGuardianshipPayload) => cancelGuardianship(payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: guardianshipsKeys.all });
			void queryClient.invalidateQueries({ queryKey: animalsKeys.all });
		}
	});
};
