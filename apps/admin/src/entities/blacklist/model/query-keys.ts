import { BlacklistListParams } from './types';

export const blacklistKeys = {
	all: ['blacklist'] as const,
	list: (params: BlacklistListParams): readonly unknown[] => [...blacklistKeys.all, 'list', params] as const
};
