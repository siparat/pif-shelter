export const guardianKeys = {
	all: ['guardian'] as const,
	profile: (userId: string): readonly unknown[] => [...guardianKeys.all, 'profile', userId] as const
};
