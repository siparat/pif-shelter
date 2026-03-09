import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { AnimalLabelUnassignedEvent } from '../../events/animal-label-unassigned/animal-label-unassigned.event';
import { CanEditAnimalPolicy } from '../../policies/can-edit-animal.policy';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { UnassignAnimalLabelCommand } from './unassign-animal-label.command';

@CommandHandler(UnassignAnimalLabelCommand)
export class UnassignAnimalLabelHandler implements ICommandHandler<UnassignAnimalLabelCommand> {
	constructor(
		private readonly repository: AnimalsRepository,
		private readonly canEditAnimalPolicy: CanEditAnimalPolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ animalId, labelId, userId, userRole }: UnassignAnimalLabelCommand): Promise<void> {
		const animal = await this.canEditAnimalPolicy.assertCanEdit(animalId, userId, userRole);

		await this.repository.unassignLabel(animal.id, labelId);

		this.eventBus.publish(new AnimalLabelUnassignedEvent(animalId, labelId));

		this.logger.log('Ярлык отвязан от животного', { animalId, labelId, userId, userRole });
	}
}
