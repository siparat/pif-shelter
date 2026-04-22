import { PostsListParams } from './types';

export const postsKeys = {
	all: ['posts'] as const,
	list: (params: PostsListParams) => [...postsKeys.all, 'list', params] as const,
	byAnimal: (animalId: string, params: Omit<PostsListParams, 'animalId'>) =>
		[...postsKeys.all, 'animal', animalId, params] as const,
	animalInfinite: (animalId: string, perPage: number) =>
		[...postsKeys.all, 'animal', animalId, 'infinite', perPage] as const,
	detail: (id: string) => [...postsKeys.all, 'detail', id] as const
};
