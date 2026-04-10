export const MeetingCacheKeys = {
	CURATOR_LIST: 'meeting:curator:list',
	curatorList: (curatorId: string, key: string) => `meeting:curator:list:${curatorId}:${key}`,
	idempotencyRequest: (key: string) => `meeting:request:${key}`
} satisfies Record<string, string | ((...args: string[]) => string)>;
