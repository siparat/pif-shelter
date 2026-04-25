import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@pif/shared';
import { adminUserKeys } from '../../../entities/admin-user';
import { setUserRole, SetUserRolePayload } from '../api/user-role.api';

export const useSetUserRoleMutation = (): UseMutationResult<
	{ userId: string; roleName: UserRole },
	Error,
	SetUserRolePayload
> => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setUserRole,
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(variables.userId) });
			void queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
		}
	});
};
