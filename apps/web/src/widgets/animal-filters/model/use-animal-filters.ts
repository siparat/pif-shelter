import { AnimalCoatEnum, AnimalGenderEnum, AnimalSizeEnum, AnimalSpeciesEnum } from '@pif/shared';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AGE_PRESETS, AgePreset, AnimalFiltersState } from './types';

const parseEnum = <T extends string>(value: string | null, allowed: readonly T[]): T | undefined =>
	value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;

const parseBool = (value: string | null): boolean | undefined => (value === 'true' ? true : undefined);

export const useAnimalFilters = (): {
	state: AnimalFiltersState;
	setSpecies: (species?: AnimalSpeciesEnum) => void;
	setFilter: <K extends keyof AnimalFiltersState>(key: K, value: AnimalFiltersState[K]) => void;
	reset: () => void;
} => {
	const [searchParams, setSearchParams] = useSearchParams();

	const state = useMemo<AnimalFiltersState>(
		() => ({
			species: parseEnum(searchParams.get('species'), Object.values(AnimalSpeciesEnum)),
			gender: parseEnum(searchParams.get('gender'), Object.values(AnimalGenderEnum)),
			size: parseEnum(searchParams.get('size'), Object.values(AnimalSizeEnum)),
			coat: parseEnum(searchParams.get('coat'), Object.values(AnimalCoatEnum)),
			age: parseEnum<AgePreset>(searchParams.get('age'), AGE_PRESETS),
			isSterilized: parseBool(searchParams.get('isSterilized')),
			isVaccinated: parseBool(searchParams.get('isVaccinated')),
			isParasiteTreated: parseBool(searchParams.get('isParasiteTreated'))
		}),
		[searchParams]
	);

	const writeParams = useCallback(
		(next: AnimalFiltersState) => {
			const params = new URLSearchParams();
			for (const [key, value] of Object.entries(next)) {
				if (value === undefined || value === false || value === '') {
					continue;
				}
				params.set(key, String(value));
			}
			setSearchParams(params, { replace: true });
		},
		[setSearchParams]
	);

	const setSpecies = useCallback(
		(species?: AnimalSpeciesEnum) => {
			writeParams({ ...state, species, size: undefined });
		},
		[state, writeParams]
	);

	const setFilter = useCallback(
		<K extends keyof AnimalFiltersState>(key: K, value: AnimalFiltersState[K]) => {
			writeParams({ ...state, [key]: value });
		},
		[state, writeParams]
	);

	const reset = useCallback(() => {
		writeParams({ species: state.species });
	}, [state.species, writeParams]);

	return { state, setSpecies, setFilter, reset };
};
