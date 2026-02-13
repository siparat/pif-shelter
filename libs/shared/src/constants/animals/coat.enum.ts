export enum AnimalCoatEnum {
	SHORT = 'SHORT',
	MEDIUM = 'MEDIUM',
	LONG = 'LONG',
	WIRE = 'WIRE',
	CURLY = 'CURLY',
	HAIRLESS = 'HAIRLESS'
}

export const AnimalCoatNames: Record<AnimalCoatEnum, string> = {
	[AnimalCoatEnum.SHORT]: 'Короткая',
	[AnimalCoatEnum.MEDIUM]: 'Средняя',
	[AnimalCoatEnum.LONG]: 'Длинная',
	[AnimalCoatEnum.WIRE]: 'Грубая',
	[AnimalCoatEnum.CURLY]: 'Кучерявая',
	[AnimalCoatEnum.HAIRLESS]: 'Без шерсти'
};
