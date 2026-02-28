import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnimalLabel } from '@pif/database';
import { Logger } from 'nestjs-pino';
import { AnimalLabelsRepository } from '../../../animals/repositories/animal-labels.repository';
import { AnimalLabelAlreadyExistsException } from '../../exceptions/animal-label-already-exists.exception';
import { AnimalLabelNotFoundException } from '../../exceptions/animal-label-not-found.exception';
import { UpdateAnimalLabelCommand } from './update-animal-label.command';

@CommandHandler(UpdateAnimalLabelCommand)
export class UpdateAnimalLabelHandler implements ICommandHandler<UpdateAnimalLabelCommand> {
	constructor(
		private readonly repository: AnimalLabelsRepository,
		private readonly logger: Logger
	) {}

	async execute({ id, dto }: UpdateAnimalLabelCommand): Promise<AnimalLabel> {
		const label = await this.repository.findById(id);
		if (!label) {
			throw new AnimalLabelNotFoundException(id);
		}

		if (dto.name && dto.name !== label.name) {
			const existing = await this.repository.findByName(dto.name);
			if (existing) {
				throw new AnimalLabelAlreadyExistsException(dto.name);
			}
		}

		const updatedLabel = await this.repository.update(id, dto);

		this.logger.log('Ярлык животных обновлен', { labelId: id, dto });

		return updatedLabel;
	}
}
