import { CreatePostRequestDto } from '@pif/contracts';
import { postMedia, posts } from '@pif/database';
import { InferInsertModel } from 'drizzle-orm';

type PostInsertModel = InferInsertModel<typeof posts>;
type PostMediaInsertModel = InferInsertModel<typeof postMedia>;

export class PostMapper {
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
}
