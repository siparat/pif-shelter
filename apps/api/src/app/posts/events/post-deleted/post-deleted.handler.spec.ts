import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '@pif/cache';
import { PostCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { PostDeletedEvent } from './post-deleted.event';
import { PostDeletedHandler } from './post-deleted.handler';

describe('PostDeletedHandler', () => {
	let handler: PostDeletedHandler;
	let cache: DeepMocked<CacheService>;

	const postId = faker.string.uuid();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PostDeletedHandler,
				{ provide: CacheService, useValue: createMock<CacheService>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<PostDeletedHandler>(PostDeletedHandler);
		cache = module.get(CacheService);
	});

	it('invalidates detail and list cache', async () => {
		cache.del.mockResolvedValue(undefined);
		cache.delByPattern.mockResolvedValue(undefined);

		await handler.handle(new PostDeletedEvent(postId));

		expect(cache.del).toHaveBeenCalledWith(PostCacheKeys.detail(postId));
		expect(cache.delByPattern).toHaveBeenCalledWith(PostCacheKeys.LIST);
	});
});
