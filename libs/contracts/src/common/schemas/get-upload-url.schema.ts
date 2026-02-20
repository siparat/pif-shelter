import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../base.responses';

export const getUploadUrlRequestSchema = z.object({
	type: z.enum(['users', 'animals'], {
		error: () => ({ message: 'Тип загрузки должен быть users или animals' })
	})
});

export class GetUploadUrlRequestDto extends createZodDto(getUploadUrlRequestSchema) {}

export const getUploadUrlResponseSchema = createApiSuccessResponseSchema(
	z.object({
		url: z.string(),
		fields: z.record(z.string(), z.string()),
		key: z.string()
	})
);

export class GetUploadUrlResponseDto extends createZodDto(getUploadUrlResponseSchema) {}
