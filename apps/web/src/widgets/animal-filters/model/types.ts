import { PublicAnimalsFilters } from '../../../entities/animal';

export const AGE_PRESETS = ['puppy', 'young', 'adult', 'senior'] as const;
export type AgePreset = (typeof AGE_PRESETS)[number];

export const AGE_PRESET_LABELS: Record<AgePreset, string> = {
	puppy: 'Малыш',
	young: 'Молодой',
	adult: 'Взрослый',
	senior: 'Старший'
};

export const AGE_PRESET_RANGES: Record<AgePreset, { minAge?: number; maxAge?: number }> = {
	puppy: { maxAge: 1 },
	young: { minAge: 1, maxAge: 3 },
	adult: { minAge: 3, maxAge: 7 },
	senior: { minAge: 7 }
};

export type AnimalFiltersState = {
	species?: NonNullable<PublicAnimalsFilters['species']>;
	gender?: NonNullable<PublicAnimalsFilters['gender']>;
	size?: NonNullable<PublicAnimalsFilters['size']>;
	coat?: NonNullable<PublicAnimalsFilters['coat']>;
	age?: AgePreset;
	isSterilized?: boolean;
	isVaccinated?: boolean;
	isParasiteTreated?: boolean;
};

export const filtersStateToQuery = (state: AnimalFiltersState): PublicAnimalsFilters => {
	const { age, ...rest } = state;
	const range = age ? AGE_PRESET_RANGES[age] : {};
	return { ...rest, ...range };
};

export const isFilterActive = (state: AnimalFiltersState): boolean =>
	Boolean(
		state.gender ||
			state.size ||
			state.coat ||
			state.age ||
			state.isSterilized ||
			state.isVaccinated ||
			state.isParasiteTreated
	);
