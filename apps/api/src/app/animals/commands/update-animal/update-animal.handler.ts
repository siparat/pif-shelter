import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { AnimalUpdatedEvent } from '../../events/animal-updated.event';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { UpdateAnimalCommand } from './update-animal.command';

@CommandHandler(UpdateAnimalCommand)
export class UpdateAnimalHandler implements ICommandHandler<UpdateAnimalCommand> {
	constructor(
		private readonly repository: AnimalsRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ id, dto }: UpdateAnimalCommand): Promise<string> {
		const updatedId = await this.repository.update(id, dto);

		this.eventBus.publish(new AnimalUpdatedEvent(updatedId));

		this.logger.log('Животное обновлено', { animalId: id, dto });

		return updatedId;
	}
}
