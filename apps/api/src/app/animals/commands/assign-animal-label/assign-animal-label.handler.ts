import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { AnimalLabelAssignedEvent } from '../../events/animal-label-assigned/animal-label-assigned.event';
import { AnimalLabelNotFoundException } from '../../exceptions/animal-label-not-found.exception';
import { CanEditAnimalPolicy } from '../../policies/can-edit-animal.policy';
import { AnimalLabelsRepository } from '../../repositories/animal-labels.repository';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { AssignAnimalLabelCommand } from './assign-animal-label.command';

@CommandHandler(AssignAnimalLabelCommand)
export class AssignAnimalLabelHandler implements ICommandHandler<AssignAnimalLabelCommand> {
	constructor(
		private readonly repository: AnimalsRepository,
		private readonly labelsRepository: AnimalLabelsRepository,
		private readonly canEditAnimalPolicy: CanEditAnimalPolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ animalId, labelId, userId, userRole }: AssignAnimalLabelCommand): Promise<void> {
		const animal = await this.canEditAnimalPolicy.assertCanEdit(animalId, userId, userRole);

		const label = await this.labelsRepository.findById(labelId);
		if (!label) throw new AnimalLabelNotFoundException(labelId);

		await this.repository.assignLabel(animal.id, labelId);

		this.eventBus.publish(new AnimalLabelAssignedEvent(animal.id, labelId));

		this.logger.log('Ярлык привязан к животному', { animalId, labelId, userId, userRole });
	}
}
