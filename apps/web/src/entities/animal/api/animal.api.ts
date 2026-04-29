import { ListAnimalsResult, listAnimalsRequestSchema } from '@pif/contracts';
import { z } from 'zod';
import { api } from '../../../shared/api/base';

export type ListAnimalsParams = z.infer<typeof listAnimalsRequestSchema>;

const buildSearchParams = (filters: Record<string, unknown>): Record<string, string> => {
	const result: Record<string, string> = {};
	for (const [key, value] of Object.entries(filters)) {
		if (value === undefined || value === null || value === '') {
			continue;
		}
		result[key] = String(value);
	}
	return result;
};

export const listAnimals = async (params: Partial<ListAnimalsParams> = {}): Promise<ListAnimalsResult> => {
	return api.get('animals', { searchParams: buildSearchParams(params) }).json<ListAnimalsResult>();
};
