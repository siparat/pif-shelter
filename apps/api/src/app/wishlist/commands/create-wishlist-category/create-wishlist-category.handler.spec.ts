import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { CreateWishlistCategoryRequestDto } from '@pif/contracts';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { WishlistDataChangedEvent } from '../../events/wishlist-data-changed/wishlist-data-changed.event';
import { WishlistRepository } from '../../repositories/wishlist.repository';
import { CreateWishlistCategoryCommand } from './create-wishlist-category.command';
import { CreateWishlistCategoryHandler } from './create-wishlist-category.handler';

describe('CreateWishlistCategoryHandler', () => {
	let handler: CreateWishlistCategoryHandler;
	let repository: DeepMocked<WishlistRepository>;
	let eventBus: DeepMocked<EventBus>;

	const dto: CreateWishlistCategoryRequestDto = { name: 'Медицина', sortOrder: 1 };

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				CreateWishlistCategoryHandler,
				{ provide: WishlistRepository, useValue: createMock<WishlistRepository>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(CreateWishlistCategoryHandler);
		repository = module.get(WishlistRepository);
		eventBus = module.get(EventBus);
	});

	it('creates category, publishes event and returns id', async () => {
		const id = randomUUID();
		repository.createCategory.mockResolvedValue(id);

		const result = await handler.execute(new CreateWishlistCategoryCommand(dto));

		expect(result).toEqual({ id });
		expect(repository.createCategory).toHaveBeenCalledWith(dto);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish.mock.calls[0][0]).toBeInstanceOf(WishlistDataChangedEvent);
	});
});
