import { AnimalStatusEnum } from '@pif/shared';

export class AnimalStatusChangedEvent {
	constructor(
		public readonly animalId: string,
		public readonly oldStatus: AnimalStatusEnum,
		public readonly newStatus: AnimalStatusEnum
	) {}
}
