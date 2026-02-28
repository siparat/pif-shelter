import { Command } from '@nestjs/cqrs';

export class UnassignAnimalLabelCommand extends Command<void> {
	constructor(
		public readonly animalId: string,
		public readonly labelId: string
	) {
		super();
	}
}
