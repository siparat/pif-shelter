import { GuardianshipStatusEnum } from '@pif/shared';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GuardianshipsListParams } from '../../../entities/guardianship';

const DEFAULT_PER_PAGE = 20;

const parsePositiveInt = (value: string | null, fallback: number): number => {
	if (!value) {
		return fallback;
	}
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseStatus = (value: string | null): GuardianshipStatusEnum | undefined => {
	if (!value) {
		return undefined;
	}
	return Object.values(GuardianshipStatusEnum).includes(value as GuardianshipStatusEnum)
		? (value as GuardianshipStatusEnum)
		: undefined;
};

export interface GuardianshipsPageFilters extends GuardianshipsListParams {
	page: number;
	perPage: number;
}

interface UseGuardianshipsPageFiltersResult {
	filters: GuardianshipsPageFilters;
	setFilters: (next: GuardianshipsPageFilters) => void;
	patchFilters: (patch: Partial<GuardianshipsPageFilters>) => void;
	resetFilters: () => void;
}

export const useGuardianshipsPageFilters = (): UseGuardianshipsPageFiltersResult => {
	const [searchParams, setSearchParams] = useSearchParams();

	const filters: GuardianshipsPageFilters = useMemo(() => {
		return {
			page: parsePositiveInt(searchParams.get('page'), 1),
			perPage: parsePositiveInt(searchParams.get('perPage'), DEFAULT_PER_PAGE),
			status: parseStatus(searchParams.get('status')),
			animalId: searchParams.get('animalId') ?? undefined,
			curatorId: searchParams.get('curatorId') ?? undefined,
			guardianUserId: searchParams.get('guardianUserId') ?? undefined,
			search: searchParams.get('search') ?? undefined,
			sort: searchParams.get('sort') ?? 'startedAt:desc'
		};
	}, [searchParams]);

	const setFilters = useCallback(
		(next: GuardianshipsPageFilters) => {
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
			if (next.animalId) {
				params.set('animalId', next.animalId);
			}
			if (next.curatorId) {
				params.set('curatorId', next.curatorId);
			}
			if (next.guardianUserId) {
				params.set('guardianUserId', next.guardianUserId);
			}
			if (next.search) {
				params.set('search', next.search);
			}
			if (next.sort && next.sort !== 'startedAt:desc') {
				params.set('sort', next.sort);
			}
			setSearchParams(params, { replace: false });
		},
		[setSearchParams]
	);

	const patchFilters = useCallback(
		(patch: Partial<GuardianshipsPageFilters>) => {
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
