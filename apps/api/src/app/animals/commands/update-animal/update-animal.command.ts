import { Command } from '@nestjs/cqrs';
import { UpdateAnimalRequestDto } from '@pif/contracts';

export class UpdateAnimalCommand extends Command<string> {
	constructor(
		public readonly id: string,
		public readonly dto: UpdateAnimalRequestDto
	) {
		super();
	}
}
