import { AnimalGenderEnum } from './gender.enum';

export enum AnimalSizeEnum {
	SMALL = 'SMALL',
	MEDIUM = 'MEDIUM',
	LARGE = 'LARGE'
}

export const AnimalSizeNames: Record<AnimalSizeEnum, Record<AnimalGenderEnum, string>> = {
	[AnimalSizeEnum.SMALL]: {
		[AnimalGenderEnum.FEMALE]: 'Маленькая',
		[AnimalGenderEnum.MALE]: 'Маленький'
	},
	[AnimalSizeEnum.MEDIUM]: {
		[AnimalGenderEnum.FEMALE]: 'Средняя',
		[AnimalGenderEnum.MALE]: 'Средний'
	},
	[AnimalSizeEnum.LARGE]: {
		[AnimalGenderEnum.FEMALE]: 'Большая',
		[AnimalGenderEnum.MALE]: 'Большой'
	}
};
