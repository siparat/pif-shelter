import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	confirmMeetingRequest,
	getCuratorMeetingRequests,
	getMeetingRequestById,
	rejectMeetingRequest
} from '../api/meeting-requests.api';
import { meetingRequestsKeys } from './query-keys';
import {
	ConfirmMeetingRequestData,
	MeetingRequestDetails,
	MeetingRequestsListData,
	MeetingRequestsListParams,
	RejectMeetingRequestData,
	RejectMeetingRequestPayload
} from './types';

const patchMeetingInLists = (
	current: MeetingRequestsListData | undefined,
	id: string,
	status: MeetingRequestDetails['status']
): MeetingRequestsListData | undefined => {
	if (!current) {
		return current;
	}

	return {
		...current,
		data: current.data.map((item) => (item.id === id ? { ...item, status } : item))
	};
};

const toMeetingRequestStatus = (
	status: ConfirmMeetingRequestData['status'] | RejectMeetingRequestData['status']
): MeetingRequestDetails['status'] => status as MeetingRequestDetails['status'];

export const useMeetingRequestsList = (params: MeetingRequestsListParams, options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: meetingRequestsKeys.list(params),
		queryFn: () => getCuratorMeetingRequests(params),
		placeholderData: (prev) => prev,
		enabled: options?.enabled ?? true
	});

export const useMeetingRequestById = (id: string | null | undefined, options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: meetingRequestsKeys.detail(id ?? 'empty'),
		queryFn: () => getMeetingRequestById(id as string),
		enabled: Boolean(id) && (options?.enabled ?? true),
		retry: false
	});

export const useConfirmMeetingRequestMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => confirmMeetingRequest(id),
		onSuccess: ({ id, status }) => {
			const nextStatus = toMeetingRequestStatus(status);
			queryClient.setQueriesData<MeetingRequestsListData>(
				{ queryKey: [...meetingRequestsKeys.all, 'list'] },
				(current) => patchMeetingInLists(current, id, nextStatus)
			);
			queryClient.setQueryData<MeetingRequestDetails | undefined>(meetingRequestsKeys.detail(id), (current) =>
				current ? { ...current, status: nextStatus } : current
			);
			void queryClient.invalidateQueries({ queryKey: meetingRequestsKeys.all });
			void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
		}
	});
};

interface RejectMutationPayload {
	id: string;
	payload: RejectMeetingRequestPayload;
}

export const useRejectMeetingRequestMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: RejectMutationPayload) => rejectMeetingRequest(id, payload),
		onSuccess: ({ id, status }, { payload }) => {
			const nextStatus = toMeetingRequestStatus(status);
			queryClient.setQueriesData<MeetingRequestsListData>(
				{ queryKey: [...meetingRequestsKeys.all, 'list'] },
				(current) => patchMeetingInLists(current, id, nextStatus)
			);
			queryClient.setQueryData<MeetingRequestDetails | undefined>(meetingRequestsKeys.detail(id), (current) =>
				current
					? {
							...current,
							status: nextStatus,
							rejectionReason: payload.reason
						}
					: current
			);
			void queryClient.invalidateQueries({ queryKey: meetingRequestsKeys.all });
			void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
		}
	});
};
