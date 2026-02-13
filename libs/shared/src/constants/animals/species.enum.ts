export enum AnimalSpeciesEnum {
	DOG = 'DOG',
	CAT = 'CAT'
}

export const AnimalSpeciesNames: Record<AnimalSpeciesEnum, string> = {
	[AnimalSpeciesEnum.DOG]: 'Собака',
	[AnimalSpeciesEnum.CAT]: 'Кошка'
};
