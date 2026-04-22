import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost, deletePost, getPostById, getPosts, updatePost } from '../api/posts.api';
import { postsKeys } from './query-keys';
import { CreatePostPayload, PostsListData, PostsListParams, UpdatePostPayload } from './types';

const POSTS_PER_PAGE = 5;

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
		perPage: params?.perPage ?? POSTS_PER_PAGE,
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

export const useAnimalPostsInfinite = (animalId: string, perPage: number = POSTS_PER_PAGE) =>
	useInfiniteQuery({
		queryKey: postsKeys.animalInfinite(animalId, perPage),
		queryFn: ({ pageParam }) =>
			getPosts({
				animalId,
				page: pageParam,
				perPage,
				sort: 'createdAt:desc'
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { page, totalPages } = lastPage.meta;
			return page < totalPages ? page + 1 : undefined;
		},
		enabled: Boolean(animalId)
	});

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

export const useUpdatePostMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdatePostPayload }) => updatePost(id, payload),
		onSuccess: async (_data, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: postsKeys.detail(variables.id) }),
				queryClient.invalidateQueries({ queryKey: postsKeys.all })
			]);
		}
	});
};

interface DeletePostMutationContext {
	previousListQueries: Array<[readonly unknown[], PostsListData | undefined]>;
	previousInfiniteQueries: Array<[readonly unknown[], unknown]>;
}

export const useDeletePostMutation = () => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { id: string }, DeletePostMutationContext>({
		mutationFn: ({ id }) => deletePost(id),
		onMutate: async ({ id }) => {
			await queryClient.cancelQueries({ queryKey: postsKeys.all });

			const previousListQueries = queryClient.getQueriesData<PostsListData>({ queryKey: postsKeys.all });
			for (const [key, data] of previousListQueries) {
				if (!data?.data) continue;
				queryClient.setQueryData<PostsListData>(key, {
					...data,
					data: data.data.filter((item) => item.id !== id),
					meta: { ...data.meta, total: Math.max(0, data.meta.total - 1) }
				});
			}

			const previousInfiniteQueries = queryClient.getQueriesData<{
				pages: PostsListData[];
				pageParams: unknown[];
			}>({ queryKey: postsKeys.all });
			for (const [key, data] of previousInfiniteQueries) {
				if (!data || !Array.isArray(data.pages)) continue;
				queryClient.setQueryData(key, {
					...data,
					pages: data.pages.map((page) => ({
						...page,
						data: page.data.filter((item) => item.id !== id),
						meta: { ...page.meta, total: Math.max(0, page.meta.total - 1) }
					}))
				});
			}

			return { previousListQueries, previousInfiniteQueries };
		},
		onError: (_error, _vars, context) => {
			if (!context) return;
			for (const [key, data] of context.previousListQueries) {
				queryClient.setQueryData(key, data);
			}
			for (const [key, data] of context.previousInfiniteQueries) {
				queryClient.setQueryData(key, data);
			}
		},
		onSettled: async (_data, _error, variables) => {
			queryClient.removeQueries({ queryKey: postsKeys.detail(variables.id) });
			await queryClient.invalidateQueries({ queryKey: postsKeys.all });
		}
	});
};
