export const adminUserKeys = {
	all: ['admin-user'] as const,
	detail: (userId: string): readonly unknown[] => [...adminUserKeys.all, 'detail', userId] as const
};
