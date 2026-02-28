import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { AnimalLabelAlreadyExistsException } from '../../exceptions/animal-label-already-exists.exception';
import { CreateAnimalLabelCommand } from './create-animal-label.command';
import { AnimalLabelsRepository } from '../../repositories/animal-labels.repository';

@CommandHandler(CreateAnimalLabelCommand)
export class CreateAnimalLabelHandler implements ICommandHandler<CreateAnimalLabelCommand> {
	constructor(
		private readonly repository: AnimalLabelsRepository,
		private readonly logger: Logger
	) {}

	async execute({ dto }: CreateAnimalLabelCommand): Promise<{ labelId: string }> {
		const { name, color } = dto;

		const existing = await this.repository.findByName(name);
		if (existing) {
			throw new AnimalLabelAlreadyExistsException(name);
		}

		const id = await this.repository.create({ name, color });

		this.logger.log('Ярлык животных создан', { labelId: id, dto });

		return { labelId: id };
	}
}
