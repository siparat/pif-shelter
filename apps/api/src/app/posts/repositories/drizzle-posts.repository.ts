import { Injectable } from '@nestjs/common';
import { CreatePostRequestDto, UpdatePostRequestDto } from '@pif/contracts';
import { DatabaseService, postMedia, posts } from '@pif/database';
import { eq } from 'drizzle-orm';
import { PostMapper } from '../mappers/post.mapper';
import { PostWithMedia, PostsRepository } from './posts.repository';

@Injectable()
export class DrizzlePostsRepository implements PostsRepository {
	constructor(private readonly db: DatabaseService) {}

	async create(
		dto: CreatePostRequestDto,
		authorId: string,
		animalAgeYears: number,
		animalAgeMonths: number
	): Promise<typeof posts.$inferInsert> {
		const postRow = PostMapper.toPostInsert(dto, authorId, animalAgeYears, animalAgeMonths);
		const [inserted] = await this.db.client.transaction(async (tx) => {
			const [post] = await tx.insert(posts).values(postRow).returning();
			const mediaRows = PostMapper.toPostMediaInserts(post.id, dto.media);
			if (mediaRows.length > 0) {
				await tx.insert(postMedia).values(mediaRows);
			}
			return [post];
		});
		return inserted;
	}

	async findById(id: string): Promise<PostWithMedia | undefined> {
		const row = await this.db.client.query.posts.findFirst({
			where: { id },
			with: { media: { orderBy: { order: 'asc' } } }
		});
		if (!row || !('media' in row) || !Array.isArray(row.media)) return undefined;
		return row;
	}

	async update(id: string, dto: UpdatePostRequestDto): Promise<typeof posts.$inferInsert> {
		const post = await this.db.client.transaction(async (tx) => {
			const updateData = PostMapper.toPostUpdate(dto);
			const [post] = await tx.update(posts).set(updateData).where(eq(posts.id, id)).returning();
			if (dto.media === undefined) {
				return post;
			}
			await tx.delete(postMedia).where(eq(postMedia.postId, id));
			if (dto.media.length > 0) {
				const mediaRows = PostMapper.toPostMediaInserts(id, dto.media);
				await tx.insert(postMedia).values(mediaRows);
			}
			return post;
		});
		return post;
	}

	async delete(id: string): Promise<boolean> {
		const [deleted] = await this.db.client.delete(posts).where(eq(posts.id, id)).returning({ id: posts.id });
		return Boolean(deleted);
	}
}
