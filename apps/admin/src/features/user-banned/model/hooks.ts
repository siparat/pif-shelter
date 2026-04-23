import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserKeys } from '../../../entities/admin-user';
import { guardianKeys } from '../../../entities/guardian';
import { setUserBanned, SetUserBannedPayload } from '../api/user-banned.api';

export const useSetUserBannedMutation = (): ReturnType<typeof useMutation<unknown, Error, SetUserBannedPayload>> => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setUserBanned,
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(variables.userId) });
			void queryClient.invalidateQueries({ queryKey: guardianKeys.all });
		}
	});
};
