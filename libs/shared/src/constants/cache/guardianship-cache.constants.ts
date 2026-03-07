export const GuardianshipCacheKeys = {
	BY_ANIMAL: 'guardianship:by-animal',
	byAnimal: (animalId: string) => `guardianship:by-animal:${animalId}`
} satisfies Record<string, string | ((...args: string[]) => string)>;
