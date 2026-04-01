export const CampaignsCacheKeys = {
	DETAIL: 'campaigns:detail',
	detail: (id: string) => `campaigns:detail:${id}`,
	LIST: 'campaigns:list'
} satisfies Record<string, string | ((...args: any[]) => string)>;
