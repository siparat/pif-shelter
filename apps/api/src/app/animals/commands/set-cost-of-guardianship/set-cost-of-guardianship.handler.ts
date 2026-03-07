import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AnimalCostOfGuardianshipSetEvent } from '../../events/animal-cost-of-guardianship-set/animal-cost-of-guardianship-set.event';
import { AnimalNotFoundException } from '../../exceptions/animal-not-found.exception';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { SetCostOfGuardianshipCommand } from './set-cost-of-guardianship.command';
import { Logger } from 'nestjs-pino';

@CommandHandler(SetCostOfGuardianshipCommand)
export class SetCostOfGuardianshipHandler implements ICommandHandler<SetCostOfGuardianshipCommand> {
	constructor(
		private readonly repository: AnimalsRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute(command: SetCostOfGuardianshipCommand): Promise<{ oldCost: number | null; newCost: number | null }> {
		const animal = await this.repository.findById(command.animalId);
		if (!animal) {
			throw new AnimalNotFoundException(command.animalId);
		}
		const oldCostRaw = animal.costOfGuardianship;
		const oldCost = oldCostRaw != null ? Number(oldCostRaw) : null;
		const newCost = command.dto.costOfGuardianship;

		if (oldCost === newCost) {
			return { newCost, oldCost };
		}

		await this.repository.setNewCostOfGuardianship(command.animalId, newCost);

		this.eventBus.publish(new AnimalCostOfGuardianshipSetEvent(animal.id, newCost, oldCost));

		this.logger.log('Стоимость опекунства установлена', {
			animalId: command.animalId,
			oldCost,
			newCost
		});

		return { newCost, oldCost };
	}
}
