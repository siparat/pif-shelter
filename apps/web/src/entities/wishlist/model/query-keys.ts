export const wishlistQueryKeys = {
	root: ['wishlist'] as const,
	public: () => [...wishlistQueryKeys.root, 'public'] as const
};
