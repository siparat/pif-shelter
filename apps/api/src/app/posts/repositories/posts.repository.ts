import { postMedia, posts } from '@pif/database';
import { CreatePostRequestDto, UpdatePostRequestDto } from '../../core/dto';

export type PostWithMedia = typeof posts.$inferSelect & {
	media: (typeof postMedia.$inferSelect)[];
};

export abstract class PostsRepository {
	abstract create(
		dto: CreatePostRequestDto,
		authorId: string,
		animalAgeYears: number,
		animalAgeMonths: number
	): Promise<typeof posts.$inferInsert>;

	abstract findById(id: string): Promise<PostWithMedia | undefined>;

	abstract update(id: string, dto: UpdatePostRequestDto): Promise<typeof posts.$inferInsert>;

	abstract delete(id: string): Promise<boolean>;
}
