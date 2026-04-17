import { AnimalsListParams } from './types';

export const animalsKeys = {
	all: ['animals'] as const,
	list: (params: AnimalsListParams) => [...animalsKeys.all, 'list', params] as const,
	detail: (id: string) => [...animalsKeys.all, 'detail', id] as const,
	labels: () => [...animalsKeys.all, 'labels'] as const
};
