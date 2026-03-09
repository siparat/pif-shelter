import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { AnimalCuratorSetEvent } from '../../events/animal-curator-set/animal-curator-set.event';
import { AnimalNotFoundException } from '../../exceptions/animal-not-found.exception';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { SetAnimalCuratorCommand } from './set-animal-curator.command';

@CommandHandler(SetAnimalCuratorCommand)
export class SetAnimalCuratorHandler implements ICommandHandler<SetAnimalCuratorCommand> {
	constructor(
		private readonly repository: AnimalsRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({
		animalId,
		curatorId
	}: SetAnimalCuratorCommand): Promise<{ animalId: string; curatorId: string | null }> {
		const animal = await this.repository.findById(animalId);
		if (!animal) {
			throw new AnimalNotFoundException(animalId);
		}

		await this.repository.setCurator(animalId, curatorId);
		this.eventBus.publish(new AnimalCuratorSetEvent(animalId));

		this.logger.log('Куратор животного обновлён', { animalId, curatorId });

		return { animalId, curatorId };
	}
}
