import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimalsListParams } from '../../../entities/animal';
import { buildAnimalsSearchParams, parseAnimalsSearchParams, resetAnimalsFilters } from '../lib/animals-query-params';

interface IAnimalsPageFilters {
	filters: AnimalsListParams;
	setFilters: (next: AnimalsListParams) => void;
	patchFilters: (patch: Partial<AnimalsListParams>) => void;
	resetFilters: () => void;
}

export const useAnimalsPageFilters = (): IAnimalsPageFilters => {
	const [searchParams, setSearchParams] = useSearchParams();

	const filters = useMemo((): AnimalsListParams => parseAnimalsSearchParams(searchParams), [searchParams]);

	const setFilters = (next: AnimalsListParams): void => {
		setSearchParams(buildAnimalsSearchParams(next));
	};

	const patchFilters = (patch: Partial<AnimalsListParams>): void => {
		setFilters({ ...filters, ...patch });
	};

	const resetFilters = (): void => {
		setFilters(resetAnimalsFilters(filters));
	};

	return {
		filters,
		setFilters,
		patchFilters,
		resetFilters
	};
};
