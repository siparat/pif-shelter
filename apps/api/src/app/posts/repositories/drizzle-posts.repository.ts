import { Injectable } from '@nestjs/common';
import { CreatePostRequestDto } from '@pif/contracts';
import { DatabaseService, postMedia, posts } from '@pif/database';
import { PostMapper } from '../mappers/post.mapper';
import { PostsRepository } from './posts.repository';

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
}
