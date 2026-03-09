import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AnimalStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';
import { AnimalStatusChangedEvent } from '../../events/animal-status-changed/animal-status-changed.event';
import { CanEditAnimalPolicy } from '../../policies/can-edit-animal.policy';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { ChangeAnimalStatusCommand } from './change-status.command';

@CommandHandler(ChangeAnimalStatusCommand)
export class ChangeAnimalStatusHandler implements ICommandHandler<ChangeAnimalStatusCommand> {
	constructor(
		private readonly repository: AnimalsRepository,
		private readonly canEditAnimalPolicy: CanEditAnimalPolicy,
		private readonly storagePolicy: FileStoragePolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({
		id,
		status,
		userId,
		userRole
	}: ChangeAnimalStatusCommand): Promise<{ id: string; status: AnimalStatusEnum }> {
		const animal = await this.canEditAnimalPolicy.assertCanEdit(id, userId, userRole);

		if (status !== AnimalStatusEnum.DRAFT) {
			if (animal.avatarUrl) await this.storagePolicy.assertExists(animal.avatarUrl);
		}

		await this.repository.changeStatus(id, status);

		this.eventBus.publish(new AnimalStatusChangedEvent(id, animal.status, status));

		this.logger.log('Статус животного обновлено', {
			animalId: id,
			oldStatus: animal.status,
			newStatus: status,
			userId,
			userRole
		});

		return { id, status };
	}
}
