export const wishlistKeys = {
	all: ['wishlist'] as const,
	manage: () => [...wishlistKeys.all, 'manage'] as const
};
