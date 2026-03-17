import { Injectable } from '@nestjs/common';
import { UserRole } from '@pif/shared';

import { PostNotFoundException } from '../exceptions/post-not-found.exception';
import { PostWithMedia, PostsRepository } from '../repositories/posts.repository';
import { InsufficientRoleException } from '../exceptions/insufficient-role.exception';
import { NotCuratorException } from '../exceptions/not-curator.exception';

@Injectable()
export class CanEditPostPolicy {
	constructor(private readonly repository: PostsRepository) {}

	async assertCanEdit(postId: string, userId: string, userRole: UserRole): Promise<PostWithMedia> {
		const post = await this.repository.findById(postId);
		if (!post) {
			throw new PostNotFoundException(postId);
		}
		if (userRole === UserRole.ADMIN || userRole === UserRole.SENIOR_VOLUNTEER) {
			return post;
		}
		if (userRole === UserRole.VOLUNTEER) {
			if (post.authorId === userId) {
				return post;
			}
			throw new NotCuratorException();
		}
		throw new InsufficientRoleException();
	}
}
