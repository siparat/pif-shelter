export const BlacklistCacheKeys = {
	LIST: 'blacklist:list',
	detail: (id: string) => `blacklist:detail:${id}`,
	DETAIL_PATTERN: 'blacklist:detail'
} satisfies Record<string, string | ((id: string) => string)>;
