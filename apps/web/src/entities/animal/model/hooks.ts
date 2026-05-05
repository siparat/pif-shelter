import { ListAnimalsResult } from '@pif/contracts';
import { AnimalSpeciesEnum, AnimalStatusEnum } from '@pif/shared';
import {
	InfiniteData,
	useInfiniteQuery,
	UseInfiniteQueryResult,
	useQuery,
	UseQueryResult
} from '@tanstack/react-query';
import { getAnimalById, listAnimals, ListAnimalsParams } from '../api/animal.api';
import { AnimalDetails, AnimalSummary } from './types';

const ANIMALS_PER_PAGE = 24;

export type PublicAnimalsFilters = Omit<Partial<ListAnimalsParams>, 'page' | 'perPage' | 'status' | 'q' | 'sort'>;

export const animalQueryKeys = {
	root: ['animals'] as const,
	list: (filters: PublicAnimalsFilters) => [...animalQueryKeys.root, 'list', filters] as const,
	count: (species: AnimalSpeciesEnum | 'all') => [...animalQueryKeys.root, 'count', species] as const,
	detail: (id: string) => [...animalQueryKeys.root, 'detail', id] as const
};

export const useAnimalQuery = (id: string | undefined): UseQueryResult<AnimalDetails, Error> =>
	useQuery({
		queryKey: animalQueryKeys.detail(id ?? ''),
		queryFn: () => getAnimalById(id as string),
		enabled: !!id,
		staleTime: 60 * 1000
	});

export const useAnimalsInfiniteQuery = (
	filters: PublicAnimalsFilters
): UseInfiniteQueryResult<InfiniteData<ListAnimalsResult>, Error> =>
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

export const useAnimalsByIdsQuery = (ids: string[]): UseQueryResult<AnimalDetails[], Error> =>
	useQuery({
		queryKey: [...animalQueryKeys.root, 'by-ids', ids],
		queryFn: () => Promise.all(ids.map((id) => getAnimalById(id))),
		enabled: ids.length > 0,
		staleTime: 5 * 60 * 1000
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

export const useAnimalsPreviewQuery = (perRow: number): UseQueryResult<AnimalSummary[], Error> =>
	useQuery({
		queryKey: [...animalQueryKeys.root, 'preview'],
		queryFn: async () => {
			const result = await listAnimals({
				status: AnimalStatusEnum.PUBLISHED,
				page: 1,
				perPage: perRow,
				sort: 'createdAt:asc'
			});
			return [...result.data].reverse();
		},
		staleTime: 5 * 60 * 1000
	});
