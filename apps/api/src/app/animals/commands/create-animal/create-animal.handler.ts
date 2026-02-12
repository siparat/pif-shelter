import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AnimalCreatedEvent } from '../../events/animal-created.event';
import { IAnimalsRepository } from '../../repositories/animals.repository.interface';
import { CreateAnimalCommand } from './create-animal.command';

@CommandHandler(CreateAnimalCommand)
export class CreateAnimalHandler implements ICommandHandler<CreateAnimalCommand> {
	constructor(
		private readonly repository: IAnimalsRepository,
		private readonly eventBus: EventBus
	) {}

	async execute(command: CreateAnimalCommand): Promise<string> {
		const { dto } = command;
		const animalId = await this.repository.create(dto);

		await this.eventBus.publish(new AnimalCreatedEvent(animalId, dto.species));

		return animalId;
	}
}
