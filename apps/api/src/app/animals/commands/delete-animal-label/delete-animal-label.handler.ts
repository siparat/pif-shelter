import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { AnimalLabelDeletedEvent } from '../../events/animal-label-deleted/animal-label-deleted.event';
import { AnimalLabelsRepository } from '../../repositories/animal-labels.repository';
import { DeleteAnimalLabelCommand } from './delete-animal-label.command';

@CommandHandler(DeleteAnimalLabelCommand)
export class DeleteAnimalLabelHandler implements ICommandHandler<DeleteAnimalLabelCommand> {
	constructor(
		private readonly repository: AnimalLabelsRepository,
		private readonly logger: Logger,
		private readonly eventBus: EventBus
	) {}

	async execute({ id }: DeleteAnimalLabelCommand): Promise<void> {
		const label = await this.repository.findById(id);
		if (!label) {
			return;
		}

		await this.repository.delete(id);
		this.eventBus.publish(new AnimalLabelDeletedEvent(id));

		this.logger.log('Ярлык животных удалён', { labelId: id });
	}
}
