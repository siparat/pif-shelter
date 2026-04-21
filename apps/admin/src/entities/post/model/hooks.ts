import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost, getPostById, getPosts } from '../api/posts.api';
import { postsKeys } from './query-keys';
import { CreatePostPayload, PostsListParams } from './types';

export const usePostsList = (params: PostsListParams) =>
	useQuery({
		queryKey: postsKeys.list(params),
		queryFn: () => getPosts(params),
		placeholderData: (prev) => prev
	});

export const useAnimalPosts = (animalId: string, params?: Omit<PostsListParams, 'animalId'>) => {
	const merged: PostsListParams = {
		animalId,
		page: params?.page ?? 1,
		perPage: params?.perPage ?? 5,
		sort: params?.sort ?? 'createdAt:desc',
		q: params?.q,
		fromDate: params?.fromDate,
		toDate: params?.toDate
	};

	return useQuery({
		queryKey: postsKeys.byAnimal(animalId, {
			page: merged.page,
			perPage: merged.perPage,
			sort: merged.sort,
			q: merged.q,
			fromDate: merged.fromDate,
			toDate: merged.toDate
		}),
		queryFn: () => getPosts(merged),
		enabled: Boolean(animalId),
		placeholderData: (prev) => prev
	});
};

export const usePostDetails = (id: string | null) =>
	useQuery({
		queryKey: postsKeys.detail(id ?? 'empty'),
		queryFn: () => getPostById(id as string),
		enabled: Boolean(id)
	});

export const useCreatePostMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreatePostPayload) => createPost(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: postsKeys.all });
		}
	});
};
