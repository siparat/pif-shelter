import { CreateAnimalRequestDto } from '../../../core/dto';

export class CreateAnimalCommand {
	constructor(public readonly dto: CreateAnimalRequestDto) {}
}
