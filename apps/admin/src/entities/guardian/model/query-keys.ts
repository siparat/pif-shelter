export const guardianKeys = {
	all: ['guardian'] as const,
	profile: (userId: string): readonly unknown[] => [...guardianKeys.all, 'profile', userId] as const,
	reports: (userId: string, page: number, perPage: number): readonly unknown[] =>
		[...guardianKeys.all, 'reports', userId, { page, perPage }] as const
};
