import { Command } from '@nestjs/cqrs';
import { AnimalLabel } from '@pif/database';
import { UpdateAnimalLabelRequestDto } from '../../../core/dto';

export class UpdateAnimalLabelCommand extends Command<AnimalLabel> {
	constructor(
		public readonly id: string,
		public readonly dto: UpdateAnimalLabelRequestDto
	) {
		super();
	}
}
