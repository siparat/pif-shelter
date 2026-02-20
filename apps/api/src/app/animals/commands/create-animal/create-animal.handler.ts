import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AnimalCreatedEvent } from '../../events/animal-created.event';
import { CreateAnimalCommand } from './create-animal.command';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';

@CommandHandler(CreateAnimalCommand)
export class CreateAnimalHandler implements ICommandHandler<CreateAnimalCommand> {
	constructor(
		private readonly repository: AnimalsRepository,
		private readonly eventBus: EventBus,
		private readonly fileStoragePolicy: FileStoragePolicy
	) {}

	async execute(command: CreateAnimalCommand): Promise<string> {
		const { dto } = command;

		await this.fileStoragePolicy.assertExists(dto.avatarKey);

		const animalId = await this.repository.create(dto);

		await this.eventBus.publish(new AnimalCreatedEvent(animalId, dto.species));

		return animalId;
	}
}
