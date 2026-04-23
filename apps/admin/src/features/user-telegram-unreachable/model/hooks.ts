import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { guardianKeys } from '../../../entities/guardian';
import { guardianshipsKeys } from '../../../entities/guardianship';
import { setUserTelegramUnreachable, SetTelegramUnreachablePayload } from '../api/user-telegram-unreachable.api';

export const useSetTelegramUnreachableMutation = (): UseMutationResult<
	{ userId: string; telegramUnreachable: boolean },
	Error,
	SetTelegramUnreachablePayload
> => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setUserTelegramUnreachable,
		onSuccess: ({ userId }) => {
			void queryClient.invalidateQueries({ queryKey: guardianKeys.profile(userId) });
			void queryClient.invalidateQueries({ queryKey: guardianshipsKeys.all });
		}
	});
};
