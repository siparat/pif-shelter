export const CampaignsCacheKeys = {
	DETAIL: 'campaigns:detail',
	detail: (id: string) => `campaigns:detail:${id}`
} satisfies Record<string, string | ((...args: any[]) => string)>;
