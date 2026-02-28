import { Command } from '@nestjs/cqrs';

export class DeleteAnimalLabelCommand extends Command<void> {
	constructor(public readonly id: string) {
		super();
	}
}
