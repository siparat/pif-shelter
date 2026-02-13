export enum AnimalGenderEnum {
	MALE = 'MALE',
	FEMALE = 'FEMALE'
}

export const AnimalGenderNames: Record<AnimalGenderEnum, string> = {
	[AnimalGenderEnum.MALE]: 'Мальчик',
	[AnimalGenderEnum.FEMALE]: 'Девочка'
};
