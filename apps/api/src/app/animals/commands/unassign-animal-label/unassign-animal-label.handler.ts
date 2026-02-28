import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { AnimalNotFoundException } from '../../exceptions/animal-not-found.exception';
import { AnimalLabelUnassignedEvent } from '../../events/animal-label-unassigned/animal-label-unassigned.event';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { UnassignAnimalLabelCommand } from './unassign-animal-label.command';

@CommandHandler(UnassignAnimalLabelCommand)
export class UnassignAnimalLabelHandler implements ICommandHandler<UnassignAnimalLabelCommand> {
	constructor(
		private readonly repository: AnimalsRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ animalId, labelId }: UnassignAnimalLabelCommand): Promise<void> {
		const animal = await this.repository.findById(animalId);
		if (!animal) throw new AnimalNotFoundException(animalId);

		await this.repository.unassignLabel(animalId, labelId);

		this.eventBus.publish(new AnimalLabelUnassignedEvent(animalId, labelId));

		this.logger.log('Ярлык отвязан от животного', { animalId, labelId });
	}
}
