import { AllowedPostReactionEmoji } from '@pif/shared';
import {
	InfiniteData,
	useInfiniteQuery,
	UseInfiniteQueryResult,
	useMutation,
	UseMutationResult,
	useQuery,
	useQueryClient,
	UseQueryResult
} from '@tanstack/react-query';
import { HTTPError } from 'ky';
import toast from 'react-hot-toast';
import { getPostById, listAnimalPosts, setPostReaction } from '../api/posts.api';
import { PostDetails, PostListItem, PostsListResult } from './types';

const POSTS_PER_PAGE = 5;

export const postsKeys = {
	all: ['posts'] as const,
	animalInfinite: (animalId: string, year: number | null) =>
		[...postsKeys.all, 'animal', animalId, 'year', year] as const,
	years: (animalId: string) => [...postsKeys.all, 'animal', animalId, 'years'] as const,
	detail: (id: string) => [...postsKeys.all, 'detail', id] as const
};

const yearRange = (year: number): { fromDate: string; toDate: string } => {
	const fromDate = `${year}-01-01`;
	const toDate = `${year + 1}-01-01`;
	return { fromDate, toDate };
};

export const useAnimalPostsInfiniteQuery = (
	animalId: string,
	year: number | null
): UseInfiniteQueryResult<InfiniteData<PostsListResult>, Error> =>
	useInfiniteQuery({
		queryKey: postsKeys.animalInfinite(animalId, year),
		initialPageParam: 1,
		queryFn: ({ pageParam }) =>
			listAnimalPosts({
				animalId,
				page: pageParam as number,
				perPage: POSTS_PER_PAGE,
				sort: 'createdAt:desc',
				...(year ? yearRange(year) : {})
			}),
		getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
		enabled: Boolean(animalId),
		staleTime: 60 * 1000
	});

export const usePostDetailsQuery = (id: string | null): UseQueryResult<PostDetails, Error> =>
	useQuery({
		queryKey: postsKeys.detail(id ?? ''),
		queryFn: () => getPostById(id as string),
		enabled: Boolean(id),
		staleTime: 60 * 1000
	});

const applyReactionLocally = (post: PostListItem, emoji: AllowedPostReactionEmoji): PostListItem => {
	const existingActive = post.reactions.find((r) => r.isActive);
	const existingTarget = post.reactions.find((r) => r.emoji === emoji);
	const isToggleOff = existingActive?.emoji === emoji;

	const updated = post.reactions.map((r) => {
		if (r.emoji === existingActive?.emoji && existingActive) {
			return { ...r, isActive: false, count: Math.max(0, r.count - 1) };
		}
		return r;
	});

	if (!isToggleOff) {
		const idx = updated.findIndex((r) => r.emoji === emoji);
		if (idx >= 0) {
			updated[idx] = { ...updated[idx], isActive: true, count: updated[idx].count + 1 };
		} else if (!existingTarget) {
			updated.push({ emoji, count: 1, isActive: true });
		}
	}

	return { ...post, reactions: updated };
};

type ReactionContext = { previous: Array<[readonly unknown[], unknown]> };

export const useSetPostReactionMutation = (
	animalId: string,
	year: number | null
): UseMutationResult<void, Error, { postId: string; emoji: AllowedPostReactionEmoji }, ReactionContext> => {
	const qc = useQueryClient();

	return useMutation<void, Error, { postId: string; emoji: AllowedPostReactionEmoji }, ReactionContext>({
		mutationFn: ({ postId, emoji }) => setPostReaction(postId, emoji),
		onMutate: async ({ postId, emoji }) => {
			await qc.cancelQueries({ queryKey: postsKeys.animalInfinite(animalId, year) });

			const previous = qc.getQueriesData({ queryKey: postsKeys.animalInfinite(animalId, year) });

			qc.setQueriesData<InfiniteData<PostsListResult>>(
				{ queryKey: postsKeys.animalInfinite(animalId, year) },
				(prev) => {
					if (!prev) {
						return prev;
					}
					return {
						...prev,
						pages: prev.pages.map((page) => ({
							...page,
							data: page.data.map((p) => (p.id === postId ? applyReactionLocally(p, emoji) : p))
						}))
					};
				}
			);

			return { previous };
		},
		onError: (err, _vars, ctx) => {
			if (err instanceof HTTPError && err.response.status == 429) {
				toast.error('Слишком много запросов');
			}
			if (!ctx) return;
			for (const [key, data] of ctx.previous) {
				qc.setQueryData(key, data);
			}
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: postsKeys.animalInfinite(animalId, year) });
		}
	});
};
