import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createWishlistCategory,
	createWishlistItem,
	deleteWishlistCategory,
	deleteWishlistItem,
	getWishlistManage,
	updateWishlistCategory,
	updateWishlistItem
} from '../api/wishlist.api';
import { wishlistKeys } from './query-keys';
import {
	CreateWishlistCategoryPayload,
	CreateWishlistItemPayload,
	UpdateWishlistCategoryPayload,
	UpdateWishlistItemPayload
} from './types';

const invalidateWishlist = async (queryClient: ReturnType<typeof useQueryClient>): Promise<void> => {
	await queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
	void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
};

export const useWishlistManage = (options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: wishlistKeys.manage(),
		queryFn: getWishlistManage,
		enabled: options?.enabled ?? true
	});

export const useCreateWishlistCategoryMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateWishlistCategoryPayload) => createWishlistCategory(payload),
		onSuccess: () => invalidateWishlist(queryClient)
	});
};

export const useUpdateWishlistCategoryMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateWishlistCategoryPayload }) =>
			updateWishlistCategory(id, payload),
		onSuccess: () => invalidateWishlist(queryClient)
	});
};

export const useDeleteWishlistCategoryMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteWishlistCategory(id),
		onSuccess: () => invalidateWishlist(queryClient)
	});
};

export const useCreateWishlistItemMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateWishlistItemPayload) => createWishlistItem(payload),
		onSuccess: () => invalidateWishlist(queryClient)
	});
};

export const useUpdateWishlistItemMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: UpdateWishlistItemPayload }) =>
			updateWishlistItem(id, payload),
		onSuccess: () => invalidateWishlist(queryClient)
	});
};

export const useDeleteWishlistItemMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteWishlistItem(id),
		onSuccess: () => invalidateWishlist(queryClient)
	});
};
