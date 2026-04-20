import { Command } from '@nestjs/cqrs';

export class DeleteAnimalCommand extends Command<void> {
	constructor(public readonly id: string) {
		super();
	}
}
