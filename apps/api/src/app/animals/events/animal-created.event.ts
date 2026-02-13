export class AnimalCreatedEvent {
	constructor(
		public readonly animalId: string,
		public readonly species: string
	) {}
}
