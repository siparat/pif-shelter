export class GuardianshipCreatedEvent {
	constructor(
		public readonly animalId: string,
		public readonly guardianshipId: string
	) {}
}
