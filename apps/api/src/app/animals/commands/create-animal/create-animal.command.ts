import { CreateAnimalDto } from '@pif/contracts';

export class CreateAnimalCommand {
	constructor(public readonly dto: CreateAnimalDto) {}
}
