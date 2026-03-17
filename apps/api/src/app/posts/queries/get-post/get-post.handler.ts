import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { PostCacheKeys } from '@pif/shared';
import { PostNotFoundException } from '../../exceptions/post-not-found.exception';
import { PostMapper, PostResponseDto } from '../../mappers/post.mapper';
import { CanViewPostPolicy } from '../../policies/can-view-post.policy';
import { PostReactionsRepository } from '../../repositories/post-reactions.repository';
import { PostsRepository } from '../../repositories/posts.repository';
import { GetPostQuery } from './get-post.query';

@QueryHandler(GetPostQuery)
export class GetPostQueryHandler implements IQueryHandler<GetPostQuery> {
	constructor(
		private readonly repository: PostsRepository,
		private readonly postReactionsRepository: PostReactionsRepository,
		private readonly cache: CacheService,
		private readonly canViewPostPolicy: CanViewPostPolicy
	) {}

	async execute(query: GetPostQuery): Promise<PostResponseDto> {
		const cacheKey = PostCacheKeys.detail(query.id);
		const cached = await this.cache.get<PostResponseDto>(cacheKey).catch(() => null);
		if (cached) {
			await this.canViewPostPolicy.assertCanView(cached, query.userId, query.userRole);
			return cached;
		}

		const post = await this.repository.findById(query.id);
		if (!post) {
			throw new PostNotFoundException(query.id);
		}
		await this.canViewPostPolicy.assertCanView(post, query.userId, query.userRole);

		const reactions = await this.postReactionsRepository.getCountsByPostId(post.id, query.visitorId);
		const response = PostMapper.toResponse(post, reactions);
		await this.cache.set(cacheKey, response).catch(() => undefined);

		return response;
	}
}
