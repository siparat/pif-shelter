import { ListAnimalsResult } from '@pif/contracts';
import { AnimalSpeciesEnum, AnimalStatusEnum } from '@pif/shared';
import { useInfiniteQuery, UseInfiniteQueryResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import { ListAnimalsParams, listAnimals } from '../api/animal.api';

const ANIMALS_PER_PAGE = 24;

export type PublicAnimalsFilters = Omit<Partial<ListAnimalsParams>, 'page' | 'perPage' | 'status' | 'q' | 'sort'>;

export const animalQueryKeys = {
	root: ['animals'] as const,
	list: (filters: PublicAnimalsFilters) => [...animalQueryKeys.root, 'list', filters] as const,
	count: (species: AnimalSpeciesEnum | 'all') => [...animalQueryKeys.root, 'count', species] as const
};

export const useAnimalsInfiniteQuery = (
	filters: PublicAnimalsFilters
): UseInfiniteQueryResult<{ pages: ListAnimalsResult[]; pageParams: number[] }, Error> =>
	useInfiniteQuery({
		queryKey: animalQueryKeys.list(filters),
		initialPageParam: 1,
		queryFn: ({ pageParam }) =>
			listAnimals({
				...filters,
				status: AnimalStatusEnum.PUBLISHED,
				page: pageParam as number,
				perPage: ANIMALS_PER_PAGE
			}),
		getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
		staleTime: 60 * 1000
	});

export const useAnimalsCountQuery = (species?: AnimalSpeciesEnum): UseQueryResult<number, Error> =>
	useQuery({
		queryKey: animalQueryKeys.count(species ?? 'all'),
		queryFn: () =>
			listAnimals({
				species,
				status: AnimalStatusEnum.PUBLISHED,
				page: 1,
				perPage: 1
			}),
		select: (data) => data.meta.total,
		staleTime: 5 * 60 * 1000
	});
