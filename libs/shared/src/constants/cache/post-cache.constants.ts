export const PostCacheKeys = {
	LIST: 'posts:list',
	DETAIL: 'posts:detail',
	detail: (id: string) => `posts:detail:${id}`
} satisfies Record<string, string | ((...args: any[]) => string)>;
