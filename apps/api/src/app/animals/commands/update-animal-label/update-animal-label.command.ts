import { Command } from '@nestjs/cqrs';
import { UpdateAnimalLabelRequestDto } from '@pif/contracts';
import { AnimalLabel } from '@pif/database';

export class UpdateAnimalLabelCommand extends Command<AnimalLabel> {
	constructor(
		public readonly id: string,
		public readonly dto: UpdateAnimalLabelRequestDto
	) {
		super();
	}
}
