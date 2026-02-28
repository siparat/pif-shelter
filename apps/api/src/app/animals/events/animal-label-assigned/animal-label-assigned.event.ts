export class AnimalLabelAssignedEvent {
	constructor(
		public readonly animalId: string,
		public readonly labelId: string
	) {}
}
