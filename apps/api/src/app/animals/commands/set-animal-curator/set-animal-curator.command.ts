import { Command } from '@nestjs/cqrs';

export class SetAnimalCuratorCommand extends Command<{ animalId: string; curatorId: string | null }> {
	constructor(
		public readonly animalId: string,
		public readonly curatorId: string | null
	) {
		super();
	}
}
