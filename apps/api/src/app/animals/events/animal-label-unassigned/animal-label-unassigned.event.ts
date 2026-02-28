export class AnimalLabelUnassignedEvent {
	constructor(
		public readonly animalId: string,
		public readonly labelId: string
	) {}
}
