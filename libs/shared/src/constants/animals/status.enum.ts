export enum AnimalStatusEnum {
	DRAFT = 'DRAFT',
	PUBLISHED = 'PUBLISHED',
	ON_TREATMENT = 'ON_TREATMENT',
	ON_PROBATION = 'ON_PROBATION',
	ADOPTED = 'ADOPTED',
	RAINBOW = 'RAINBOW'
}

export const AnimalStatusNames: Record<AnimalStatusEnum, string> = {
	[AnimalStatusEnum.DRAFT]: 'Черновик',
	[AnimalStatusEnum.PUBLISHED]: 'Опубликовано',
	[AnimalStatusEnum.ON_TREATMENT]: 'На лечении',
	[AnimalStatusEnum.ON_PROBATION]: 'На испытательном сроке',
	[AnimalStatusEnum.ADOPTED]: 'Приючено',
	[AnimalStatusEnum.RAINBOW]: 'На радуге'
};
