import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { AnimalLabelNotFoundException } from '../../exceptions/animal-label-not-found.exception';
import { AnimalNotFoundException } from '../../exceptions/animal-not-found.exception';
import { AnimalLabelAssignedEvent } from '../../events/animal-label-assigned/animal-label-assigned.event';
import { AnimalLabelsRepository } from '../../repositories/animal-labels.repository';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { AssignAnimalLabelCommand } from './assign-animal-label.command';

@CommandHandler(AssignAnimalLabelCommand)
export class AssignAnimalLabelHandler implements ICommandHandler<AssignAnimalLabelCommand> {
	constructor(
		private readonly repository: AnimalsRepository,
		private readonly labelsRepository: AnimalLabelsRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ animalId, labelId }: AssignAnimalLabelCommand): Promise<void> {
		const animal = await this.repository.findById(animalId);
		if (!animal) throw new AnimalNotFoundException(animalId);

		const label = await this.labelsRepository.findById(labelId);
		if (!label) throw new AnimalLabelNotFoundException(labelId);

		await this.repository.assignLabel(animalId, labelId);

		this.eventBus.publish(new AnimalLabelAssignedEvent(animalId, labelId));

		this.logger.log('Ярлык привязан к животному', { animalId, labelId });
	}
}
