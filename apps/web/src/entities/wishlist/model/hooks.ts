import { useQuery } from '@tanstack/react-query';
import type { GetPublicWishlistData } from '@pif/contracts';
import { getPublicWishlist } from '../api/wishlist.api';
import { wishlistQueryKeys } from './query-keys';

export const usePublicWishlistQuery = (): {
	data: GetPublicWishlistData | undefined;
	isLoading: boolean;
	isError: boolean;
	refetch: () => void;
} => {
	const query = useQuery({
		queryKey: wishlistQueryKeys.public(),
		queryFn: getPublicWishlist,
		staleTime: 60_000
	});

	return {
		data: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		refetch: () => {
			void query.refetch();
		}
	};
};
