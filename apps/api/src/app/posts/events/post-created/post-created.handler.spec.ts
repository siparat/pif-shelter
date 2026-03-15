import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '@pif/cache';
import { PostCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { PostCreatedEvent } from './post-created.event';
import { PostCreatedHandler } from './post-created.handler';

describe('PostCreatedHandler', () => {
	let handler: PostCreatedHandler;
	let cache: DeepMocked<CacheService>;

	const postId = faker.string.uuid();
	const post = { id: postId } as never;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PostCreatedHandler,
				{ provide: CacheService, useValue: createMock<CacheService>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<PostCreatedHandler>(PostCreatedHandler);
		cache = module.get(CacheService);
	});

	it('invalidates detail and list cache', async () => {
		cache.del.mockResolvedValue(undefined);
		cache.delByPattern.mockResolvedValue(undefined);

		await handler.handle(new PostCreatedEvent(post));

		expect(cache.del).toHaveBeenCalledWith(PostCacheKeys.detail(postId));
		expect(cache.delByPattern).toHaveBeenCalledWith(PostCacheKeys.LIST);
	});
});
