import { CreatePostRequestDto } from '@pif/contracts';
import { posts } from '@pif/database';

export abstract class PostsRepository {
	abstract create(
		dto: CreatePostRequestDto,
		authorId: string,
		animalAgeYears: number,
		animalAgeMonths: number
	): Promise<typeof posts.$inferInsert>;
}
