import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { UsersService } from '../../../users/users.service';
import { AnimalCuratorSetEvent } from '../../events/animal-curator-set/animal-curator-set.event';
import { AnimalNotFoundException } from '../../exceptions/animal-not-found.exception';
import { CuratorNotFoundException } from '../../exceptions/curator-nof-found.exception';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { SetAnimalCuratorCommand } from './set-animal-curator.command';

@CommandHandler(SetAnimalCuratorCommand)
export class SetAnimalCuratorHandler implements ICommandHandler<SetAnimalCuratorCommand> {
	constructor(
		private readonly repository: AnimalsRepository,
		private readonly usersService: UsersService,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({
		animalId,
		curatorId
	}: SetAnimalCuratorCommand): Promise<{ animalId: string; curatorId: string | null }> {
		const animal = await this.repository.findById(animalId);
		if (!animal) {
			throw new AnimalNotFoundException(animalId);
		}

		if (curatorId == animal.curatorId) {
			return { animalId, curatorId };
		}

		if (curatorId !== null) {
			const curator = await this.usersService.findById(curatorId);
			if (!curator) {
				throw new CuratorNotFoundException(curatorId);
			}
		}

		await this.repository.setCurator(animalId, curatorId);
		this.eventBus.publish(new AnimalCuratorSetEvent(animalId));

		this.logger.log('Куратор животного обновлён', { animalId, curatorId });

		return { animalId, curatorId };
	}
}
