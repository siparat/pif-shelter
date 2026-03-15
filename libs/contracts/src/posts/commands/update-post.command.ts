import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { createPostRequestSchema } from './create-post.command';

export const updatePostRequestSchema = createPostRequestSchema.partial().omit({ animalId: true });

export class UpdatePostRequestDto extends createZodDto(updatePostRequestSchema) {}

export const updatePostResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid().describe('Идентификатор поста')
	})
);

export class UpdatePostResponseDto extends createZodDto(updatePostResponseSchema) {}
