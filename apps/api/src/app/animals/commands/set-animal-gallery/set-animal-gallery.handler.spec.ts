import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { AnimalGalleryUpdatedEvent } from '../../events/animal-gallery-updated/animal-gallery-updated.event';
import { AnimalNotEditableByUserException } from '../../exceptions/animal-not-editable-by-user.exception';
import { AnimalNotFoundException } from '../../exceptions/animal-not-found.exception';
import { CanEditAnimalPolicy } from '../../policies/can-edit-animal.policy';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { SetAnimalGalleryCommand } from './set-animal-gallery.command';
import { SetAnimalGalleryHandler } from './set-animal-gallery.handler';

describe('SetAnimalGalleryHandler', () => {
	let handler: SetAnimalGalleryHandler;
	let repository: DeepMocked<AnimalsRepository>;
	let canEditAnimalPolicy: DeepMocked<CanEditAnimalPolicy>;
	let eventBus: DeepMocked<EventBus>;

	const animalId = faker.string.uuid();
	const userId = faker.string.uuid();
	const userRole = UserRole.ADMIN;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SetAnimalGalleryHandler,
				{ provide: AnimalsRepository, useValue: createMock<AnimalsRepository>() },
				{ provide: CanEditAnimalPolicy, useValue: createMock<CanEditAnimalPolicy>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(SetAnimalGalleryHandler);
		repository = module.get(AnimalsRepository);
		canEditAnimalPolicy = module.get(CanEditAnimalPolicy);
		eventBus = module.get(EventBus);
	});

	it('updates gallery and publishes AnimalGalleryUpdatedEvent', async () => {
		const oldKeys = ['old-1.jpg', 'old-2.jpg'];
		const newKeys = ['new-1.jpg', 'new-2.jpg', 'new-3.jpg'];
		canEditAnimalPolicy.assertCanEdit.mockResolvedValue({
			id: animalId,
			galleryUrls: oldKeys
		} as never);

		const result = await handler.execute(new SetAnimalGalleryCommand(animalId, newKeys, userId, userRole));

		expect(canEditAnimalPolicy.assertCanEdit).toHaveBeenCalledWith(animalId, userId, userRole);
		expect(repository.setGallery).toHaveBeenCalledWith(animalId, newKeys);
		expect(eventBus.publish).toHaveBeenCalledWith(new AnimalGalleryUpdatedEvent(animalId, oldKeys, newKeys));
		expect(result).toEqual({ animalId, galleryUrls: newKeys });
	});

	it('handles empty previous gallery (null galleryUrls)', async () => {
		const newKeys = ['photo-1.jpg'];
		canEditAnimalPolicy.assertCanEdit.mockResolvedValue({
			id: animalId,
			galleryUrls: null
		} as never);

		const result = await handler.execute(new SetAnimalGalleryCommand(animalId, newKeys, userId, userRole));

		expect(repository.setGallery).toHaveBeenCalledWith(animalId, newKeys);
		expect(eventBus.publish).toHaveBeenCalledWith(new AnimalGalleryUpdatedEvent(animalId, [], newKeys));
		expect(result).toEqual({ animalId, galleryUrls: newKeys });
	});

	it('allows clearing the gallery with an empty array', async () => {
		const oldKeys = ['old-1.jpg'];
		canEditAnimalPolicy.assertCanEdit.mockResolvedValue({
			id: animalId,
			galleryUrls: oldKeys
		} as never);

		const result = await handler.execute(new SetAnimalGalleryCommand(animalId, [], userId, userRole));

		expect(repository.setGallery).toHaveBeenCalledWith(animalId, []);
		expect(eventBus.publish).toHaveBeenCalledWith(new AnimalGalleryUpdatedEvent(animalId, oldKeys, []));
		expect(result).toEqual({ animalId, galleryUrls: [] });
	});

	it('propagates AnimalNotFoundException from policy', async () => {
		canEditAnimalPolicy.assertCanEdit.mockRejectedValue(new AnimalNotFoundException(animalId));

		await expect(
			handler.execute(new SetAnimalGalleryCommand(animalId, ['key-1.jpg'], userId, userRole))
		).rejects.toThrow(AnimalNotFoundException);

		expect(repository.setGallery).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('propagates AnimalNotEditableByUserException for non-curator VOLUNTEER', async () => {
		canEditAnimalPolicy.assertCanEdit.mockRejectedValue(new AnimalNotEditableByUserException());

		await expect(
			handler.execute(new SetAnimalGalleryCommand(animalId, ['key-1.jpg'], userId, UserRole.VOLUNTEER))
		).rejects.toThrow(AnimalNotEditableByUserException);

		expect(repository.setGallery).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});
});
