import { MeetingRequestStatusEnum } from '@pif/shared';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MeetingRequestsListParams } from '../../../entities/meeting-request';

const DEFAULT_PER_PAGE = 20;

const parsePositiveInt = (value: string | null, fallback: number): number => {
	if (!value) {
		return fallback;
	}
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseStatus = (value: string | null): MeetingRequestStatusEnum | undefined => {
	if (!value) {
		return undefined;
	}
	return Object.values(MeetingRequestStatusEnum).includes(value as MeetingRequestStatusEnum)
		? (value as MeetingRequestStatusEnum)
		: undefined;
};

export interface MeetingsPageFilters extends Omit<MeetingRequestsListParams, 'sort'> {
	page: number;
	perPage: number;
	sort: NonNullable<MeetingRequestsListParams['sort']>;
	upcoming24hOnly: boolean;
}

interface UseMeetingsPageFiltersResult {
	filters: MeetingsPageFilters;
	setFilters: (next: MeetingsPageFilters) => void;
	patchFilters: (patch: Partial<MeetingsPageFilters>) => void;
	resetFilters: () => void;
}

export const useMeetingsPageFilters = (): UseMeetingsPageFiltersResult => {
	const [searchParams, setSearchParams] = useSearchParams();

	const filters: MeetingsPageFilters = useMemo(
		() => ({
			page: parsePositiveInt(searchParams.get('page'), 1),
			perPage: parsePositiveInt(searchParams.get('perPage'), DEFAULT_PER_PAGE),
			status: parseStatus(searchParams.get('status')),
			sort: (searchParams.get('sort') as MeetingRequestsListParams['sort']) ?? 'createdAt:desc',
			upcoming24hOnly: searchParams.get('upcoming24hOnly') === 'true'
		}),
		[searchParams]
	);

	const setFilters = useCallback(
		(next: MeetingsPageFilters) => {
			const params = new URLSearchParams();
			if (next.page && next.page !== 1) {
				params.set('page', String(next.page));
			}
			if (next.perPage && next.perPage !== DEFAULT_PER_PAGE) {
				params.set('perPage', String(next.perPage));
			}
			if (next.status) {
				params.set('status', next.status);
			}
			if (next.sort && next.sort !== 'createdAt:desc') {
				params.set('sort', next.sort);
			}
			if (next.upcoming24hOnly) {
				params.set('upcoming24hOnly', 'true');
			}
			setSearchParams(params, { replace: false });
		},
		[setSearchParams]
	);

	const patchFilters = useCallback(
		(patch: Partial<MeetingsPageFilters>) => {
			setFilters({ ...filters, ...patch });
		},
		[filters, setFilters]
	);

	const resetFilters = useCallback(() => {
		setSearchParams(new URLSearchParams(), { replace: true });
	}, [setSearchParams]);

	return {
		filters,
		setFilters,
		patchFilters,
		resetFilters
	};
};
