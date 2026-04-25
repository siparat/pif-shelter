export const adminUserKeys = {
	all: ['admin-user'] as const,
	list: (includeGuardians = false): readonly unknown[] => [...adminUserKeys.all, 'list', includeGuardians] as const,
	detail: (userId: string): readonly unknown[] => [...adminUserKeys.all, 'detail', userId] as const
};
