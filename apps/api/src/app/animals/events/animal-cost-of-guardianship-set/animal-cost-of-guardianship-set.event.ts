export class AnimalCostOfGuardianshipSetEvent {
	constructor(
		public readonly animalId: string,
		public readonly newCost: number | null,
		public readonly oldCost: number | null
	) {}
}
