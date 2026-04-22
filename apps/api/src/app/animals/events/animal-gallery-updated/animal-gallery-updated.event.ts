export class AnimalGalleryUpdatedEvent {
	constructor(
		public readonly animalId: string,
		public readonly oldKeys: string[],
		public readonly newKeys: string[]
	) {}
}
