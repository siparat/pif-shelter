export const GuardianshipCacheKeys = {
	BY_ANIMAL: 'guardianship:by-animal',
	ACTIVE_BY_USER_ID: 'guardianships:active-by-user-id',
	byAnimal: (animalId: string) => `guardianship:by-animal:${animalId}`,
	activeByUserId: (userId: string) => `guardianships:active-by-user-id:${userId}`
} satisfies Record<string, string | ((...args: string[]) => string)>;
