import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { AnimalNotFoundException } from '../../exceptions/animal-not-found.exception';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { DeleteAnimalCommand } from './delete-animal.command';

@CommandHandler(DeleteAnimalCommand)
export class DeleteAnimalHandler implements ICommandHandler<DeleteAnimalCommand> {
	constructor(
		private readonly animalsRepository: AnimalsRepository,
		private readonly logger: Logger
	) {}

	async execute({ id }: DeleteAnimalCommand): Promise<void> {
		const animal = await this.animalsRepository.findById(id);
		if (!animal) {
			throw new AnimalNotFoundException(id);
		}

		await this.animalsRepository.delete(id);

		this.logger.log('Животное удалено', { animalId: id });
	}
}
