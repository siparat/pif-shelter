import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { adminUserKeys } from '../../../entities/admin-user';
import { createInvitation, CreateInvitationPayload } from '../api/user-invitation.api';

export const useCreateInvitationMutation = (): UseMutationResult<
	{ invitationId: string },
	Error,
	CreateInvitationPayload
> => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createInvitation,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
		}
	});
};
