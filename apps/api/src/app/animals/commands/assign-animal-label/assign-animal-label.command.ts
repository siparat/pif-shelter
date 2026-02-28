import { Command } from '@nestjs/cqrs';

export class AssignAnimalLabelCommand extends Command<void> {
	constructor(
		public readonly animalId: string,
		public readonly labelId: string
	) {
		super();
	}
}
