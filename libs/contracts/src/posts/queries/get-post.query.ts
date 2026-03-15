import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { PostMediaTypeEnum, PostVisibilityEnum } from '@pif/shared';

const postMediaItemResponseSchema = z.object({
	id: z.uuid().describe('Идентификатор медиа'),
	storageKey: z.string().describe('Ключ файла в хранилище'),
	type: z.enum(PostMediaTypeEnum).describe('Тип медиа'),
	order: z.number().int().min(0).describe('Порядок отображения')
});

export const postResponseSchema = z.object({
	id: z.uuid(),
	animalId: z.uuid(),
	authorId: z.string(),
	title: z.string(),
	body: z.string(),
	visibility: z.enum(PostVisibilityEnum),
	media: z.array(postMediaItemResponseSchema),
	campaignId: z.uuid().nullable(),
	animalAgeYears: z.number().int().min(0),
	animalAgeMonths: z.number().int().min(0),
	createdAt: z.string(),
	updatedAt: z.string()
});

export const getPostResponseSchema = createApiSuccessResponseSchema(postResponseSchema);
export class GetPostResponseDto extends createZodDto(getPostResponseSchema) {}
