import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { createPostRequestSchema } from './create-post.command';

export const updatePostRequestSchema = createPostRequestSchema.partial().omit({ animalId: true });

export const updatePostResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid().describe('Идентификатор поста')
	})
);
