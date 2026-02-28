import { Command } from '@nestjs/cqrs';
import { CreateAnimalLabelRequestDto } from '@pif/contracts';

export class CreateAnimalLabelCommand extends Command<{ labelId: string }> {
	constructor(public readonly dto: CreateAnimalLabelRequestDto) {
		super();
	}
}
