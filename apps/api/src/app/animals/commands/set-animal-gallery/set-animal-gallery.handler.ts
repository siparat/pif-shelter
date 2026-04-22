import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { AnimalGalleryUpdatedEvent } from '../../events/animal-gallery-updated/animal-gallery-updated.event';
import { CanEditAnimalPolicy } from '../../policies/can-edit-animal.policy';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { SetAnimalGalleryCommand } from './set-animal-gallery.command';

@CommandHandler(SetAnimalGalleryCommand)
export class SetAnimalGalleryHandler implements ICommandHandler<SetAnimalGalleryCommand> {
	constructor(
		private readonly repository: AnimalsRepository,
		private readonly canEditAnimalPolicy: CanEditAnimalPolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({
		animalId,
		galleryKeys,
		userId,
		userRole
	}: SetAnimalGalleryCommand): Promise<{ animalId: string; galleryUrls: string[] }> {
		const animal = await this.canEditAnimalPolicy.assertCanEdit(animalId, userId, userRole);
		const oldKeys = animal.galleryUrls ?? [];

		await this.repository.setGallery(animalId, galleryKeys);

		this.eventBus.publish(new AnimalGalleryUpdatedEvent(animalId, oldKeys, galleryKeys));

		this.logger.log('Галерея животного обновлена', {
			animalId,
			oldCount: oldKeys.length,
			newCount: galleryKeys.length,
			userId,
			userRole
		});

		return { animalId, galleryUrls: galleryKeys };
	}
}
