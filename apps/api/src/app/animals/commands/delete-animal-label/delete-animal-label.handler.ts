import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { AnimalLabelsRepository } from '../../repositories/animal-labels.repository';
import { DeleteAnimalLabelCommand } from './delete-animal-label.command';

@CommandHandler(DeleteAnimalLabelCommand)
export class DeleteAnimalLabelHandler implements ICommandHandler<DeleteAnimalLabelCommand> {
	constructor(
		private readonly repository: AnimalLabelsRepository,
		private readonly logger: Logger
	) {}

	async execute({ id }: DeleteAnimalLabelCommand): Promise<void> {
		const label = await this.repository.findById(id);
		if (!label) {
			return;
		}

		this.logger.log('Ярлык животных удалён', { labelId: id });

		await this.repository.delete(id);
	}
}
