export const AnimalCacheKeys = {
	LIST: 'animals:list',
	DETAIL: 'animals:detail',
	LABELS_LIST: 'animals:labels',
	detail: (id: string) => `animals:detail:${id}`
} satisfies Record<string, string | ((...args: any[]) => string)>;
