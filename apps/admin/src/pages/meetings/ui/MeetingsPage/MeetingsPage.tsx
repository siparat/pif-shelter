import { Loader2 } from 'lucide-react';
import { JSX, useState } from 'react';
import { MeetingRequestItem, useMeetingRequestsList } from '../../../../entities/meeting-request';
import { ConfirmMeetingRequestModal } from '../../../../features/meeting-request-confirm';
import { RejectMeetingRequestModal } from '../../../../features/meeting-request-reject';
import { MeetingsFilters } from '../../../../features/meeting-requests-filters';
import { EmptyState, ErrorState, PageTitle, Pagination, Select } from '../../../../shared/ui';
import { useMeetingsPageFilters } from '../../model/use-meetings-page-filters';
import { MeetingsTable } from '../MeetingsTable/MeetingsTable';

const isUpcoming24h = (meetingAt: string): boolean => {
	const meetingTs = new Date(meetingAt).getTime();
	const now = Date.now();
	const in24h = now + 24 * 60 * 60 * 1000;
	return meetingTs >= now && meetingTs <= in24h;
};

export const MeetingsPage = (): JSX.Element => {
	const { filters, patchFilters, resetFilters } = useMeetingsPageFilters();
	const [confirmTarget, setConfirmTarget] = useState<MeetingRequestItem | null>(null);
	const [rejectTarget, setRejectTarget] = useState<MeetingRequestItem | null>(null);
	const query = useMeetingRequestsList({
		page: filters.page,
		perPage: filters.perPage,
		status: filters.status,
		sort: filters.sort
	});

	const meetingsRaw = query.data?.data ?? [];
	const meetings = filters.upcoming24hOnly
		? meetingsRaw.filter((item) => isUpcoming24h(item.meetingAt))
		: meetingsRaw;
	const meta = query.data?.meta;

	if (query.isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (query.isError) {
		return (
			<ErrorState
				description={query.error?.message ?? 'Не удалось загрузить список заявок.'}
				onRetry={() => void query.refetch()}
			/>
		);
	}

	return (
		<div className="space-y-6 pb-10">
			<PageTitle title="Заявки на встречу" subtitle="Список заявок на знакомство с животными." />

			<MeetingsFilters
				status={filters.status}
				sort={filters.sort}
				onStatusChange={(status) => patchFilters({ status, page: 1 })}
				onSortChange={(sort) => patchFilters({ sort, page: 1 })}
				upcoming24hOnly={filters.upcoming24hOnly}
				onUpcoming24hOnlyChange={(upcoming24hOnly) => patchFilters({ upcoming24hOnly, page: 1 })}
				onReset={resetFilters}
			/>

			<div className="flex items-center justify-between gap-3">
				<p className="text-sm text-(--color-text-secondary)">Всего: {meta?.total ?? 0}</p>
				<div className="flex items-center gap-2">
					<Select<number>
						value={filters.perPage}
						onChange={(event) => patchFilters({ page: 1, perPage: Number(event.target.value) })}
						options={[
							{ value: 10, label: '10 на странице' },
							{ value: 20, label: '20 на странице' },
							{ value: 50, label: '50 на странице' }
						]}
						small
					/>
				</div>
			</div>

			{meetings.length === 0 ? (
				<EmptyState
					title="Заявки не найдены"
					description="Попробуйте изменить фильтры или сбросить их."
					actionLabel="Сбросить фильтры"
					onAction={resetFilters}
				/>
			) : (
				<MeetingsTable
					meetings={meetings}
					onConfirm={(meeting) => setConfirmTarget(meeting)}
					onReject={(meeting) => setRejectTarget(meeting)}
				/>
			)}

			<Pagination
				page={meta?.page ?? filters.page}
				totalPages={meta?.totalPages ?? 1}
				onPageChange={(page) => patchFilters({ page })}
			/>

			{confirmTarget && (
				<ConfirmMeetingRequestModal
					meetingRequestId={confirmTarget.id}
					animalName={confirmTarget.animal.name}
					applicantName={confirmTarget.name}
					onClose={() => setConfirmTarget(null)}
				/>
			)}

			{rejectTarget && (
				<RejectMeetingRequestModal
					meetingRequestId={rejectTarget.id}
					animalName={rejectTarget.animal.name}
					applicantName={rejectTarget.name}
					onClose={() => setRejectTarget(null)}
				/>
			)}
		</div>
	);
};

export default MeetingsPage;
