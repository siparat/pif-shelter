import { listAnimalsRequestSchema } from '@pif/contracts';
import { AnimalsListParams } from '../../../entities/animal';

const DEFAULT_FILTERS: AnimalsListParams = listAnimalsRequestSchema.parse({});

export const parseAnimalsSearchParams = (search: URLSearchParams): AnimalsListParams => {
	const parsed = listAnimalsRequestSchema.safeParse(Object.fromEntries(search.entries()));
	if (!parsed.success) {
		return DEFAULT_FILTERS;
	}
	return parsed.data;
};

export const buildAnimalsSearchParams = (params: AnimalsListParams): URLSearchParams => {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null || value === '') {
			return;
		}
		searchParams.set(key, String(value));
	});

	return searchParams;
};

export const resetAnimalsFilters = (params: AnimalsListParams): AnimalsListParams => ({
	page: 1,
	perPage: params.perPage ?? 20,
	sort: params.sort ?? 'createdAt:desc'
});
