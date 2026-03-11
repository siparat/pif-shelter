import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { AnimalUpdatedEvent } from '../../events/animal-updated/animal-updated.event';
import { CanEditAnimalPolicy } from '../../policies/can-edit-animal.policy';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { UpdateAnimalCommand } from './update-animal.command';

@CommandHandler(UpdateAnimalCommand)
export class UpdateAnimalHandler implements ICommandHandler<UpdateAnimalCommand> {
	constructor(
		private readonly repository: AnimalsRepository,
		private readonly canEditAnimalPolicy: CanEditAnimalPolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ id, dto, userId, userRole }: UpdateAnimalCommand): Promise<string> {
		const oldAnimalData = await this.canEditAnimalPolicy.assertCanEdit(id, userId, userRole);
		const updatedId = await this.repository.update(id, dto);

		this.eventBus.publish(new AnimalUpdatedEvent(oldAnimalData, dto));

		this.logger.log('Животное обновлено', { animalId: id, dto, userId, userRole });

		return updatedId;
	}
}
