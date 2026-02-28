import { Command } from '@nestjs/cqrs';
import { AnimalStatusEnum } from '@pif/shared';

export class ChangeAnimalStatusCommand extends Command<{ id: string; status: AnimalStatusEnum }> {
	constructor(
		public readonly id: string,
		public readonly status: AnimalStatusEnum
	) {
		super();
	}
}
