import { postResponseSchema } from '@pif/contracts';
import { postMedia, posts } from '@pif/database';
import { InferInsertModel } from 'drizzle-orm';
import { z } from 'zod';
import { CreatePostRequestDto, UpdatePostRequestDto } from '../../core/dto';
import { PostReactionCount } from '../repositories/post-reactions.repository';
import { PostWithMedia } from '../repositories/posts.repository';

type PostInsertModel = InferInsertModel<typeof posts>;
type PostMediaInsertModel = InferInsertModel<typeof postMedia>;
type PostUpdateModel = Partial<typeof posts.$inferInsert>;
export type PostResponseDto = z.infer<typeof postResponseSchema>;

export class PostMapper {
	static toPostUpdate(dto: UpdatePostRequestDto): PostUpdateModel {
		return {
			title: dto.title,
			body: dto.body,
			visibility: dto.visibility,
			campaignId: null
		};
	}

	static toPostInsert(
		dto: CreatePostRequestDto,
		authorId: string,
		animalAgeYears: number,
		animalAgeMonths: number
	): PostInsertModel {
		return {
			animalId: dto.animalId,
			authorId,
			title: dto.title,
			body: dto.body,
			visibility: dto.visibility,
			campaignId: null,
			animalAgeYears,
			animalAgeMonths
		};
	}

	static toPostMediaInserts(postId: string, media: CreatePostRequestDto['media']): PostMediaInsertModel[] {
		return media.map((item) => ({
			postId,
			storageKey: item.storageKey,
			type: item.type,
			order: item.order
		}));
	}

	static toResponse(post: PostWithMedia, reactions: PostReactionCount[] = []): PostResponseDto {
		return {
			id: post.id,
			animalId: post.animalId,
			authorId: post.authorId,
			title: post.title,
			body: post.body,
			visibility: post.visibility,
			media: post.media.map((m) => ({ id: m.id, storageKey: m.storageKey, type: m.type, order: m.order })),
			reactions,
			campaignId: post.campaignId,
			animalAgeYears: post.animalAgeYears,
			animalAgeMonths: post.animalAgeMonths,
			createdAt: typeof post.createdAt === 'string' ? post.createdAt : (post.createdAt?.toISOString() ?? ''),
			updatedAt: typeof post.updatedAt === 'string' ? post.updatedAt : (post.updatedAt?.toISOString() ?? '')
		};
	}
}
