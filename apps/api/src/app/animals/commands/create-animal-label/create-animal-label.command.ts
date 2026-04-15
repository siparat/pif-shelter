import { Command } from '@nestjs/cqrs';
import { CreateAnimalLabelRequestDto } from '../../../core/dto';

export class CreateAnimalLabelCommand extends Command<{ labelId: string }> {
	constructor(public readonly dto: CreateAnimalLabelRequestDto) {
		super();
	}
}
