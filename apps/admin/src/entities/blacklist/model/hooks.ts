import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	approveContacts,
	banContacts,
	deleteBlacklistEntry,
	getBlacklist,
	suspectContacts
} from '../api/blacklist.api';
import { blacklistKeys } from './query-keys';
import { BanContactsPayload, BlacklistListParams, SuspectContactsPayload } from './types';

export const useBlacklistList = (params: BlacklistListParams) =>
	useQuery({
		queryKey: blacklistKeys.list(params),
		queryFn: () => getBlacklist(params),
		placeholderData: (prev) => prev
	});

export const useBanContactsMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: BanContactsPayload) => banContacts(payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: blacklistKeys.all });
			void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
		}
	});
};

export const useSuspectContactsMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: SuspectContactsPayload) => suspectContacts(payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: blacklistKeys.all });
			void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
		}
	});
};

export const useApproveContactsMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (sources: BanContactsPayload['sources']) => approveContacts(sources),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: blacklistKeys.all });
			void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
		}
	});
};

export const useDeleteBlacklistEntryMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteBlacklistEntry(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: blacklistKeys.all });
			void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
		}
	});
};
