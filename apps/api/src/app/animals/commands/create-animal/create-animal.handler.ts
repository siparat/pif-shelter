import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';
import { AnimalCreatedEvent } from '../../events/animal-created.event';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { CreateAnimalCommand } from './create-animal.command';

@CommandHandler(CreateAnimalCommand)
export class CreateAnimalHandler implements ICommandHandler<CreateAnimalCommand> {
	constructor(
		private readonly repository: AnimalsRepository,
		private readonly eventBus: EventBus,
		private readonly fileStoragePolicy: FileStoragePolicy,
		private readonly logger: Logger
	) {}

	async execute(command: CreateAnimalCommand): Promise<string> {
		const { dto } = command;

		await this.fileStoragePolicy.assertExists(dto.avatarKey);

		const animalId = await this.repository.create(dto);

		await this.eventBus.publish(new AnimalCreatedEvent(animalId, dto.species));

		this.logger.log('Животное создано', { animalId, dto });

		return animalId;
	}
}
