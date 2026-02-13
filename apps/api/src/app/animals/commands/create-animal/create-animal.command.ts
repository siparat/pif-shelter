import { CreateAnimalRequestDto } from '@pif/contracts';

export class CreateAnimalCommand {
	constructor(public readonly dto: CreateAnimalRequestDto) {}
}
