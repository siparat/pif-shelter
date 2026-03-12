import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../base.responses';
import { ALLOW_IMAGE_EXT, ALLOW_VIDEO_EXT } from '@pif/shared';

const ALLOWED_EXTENSIONS = [...ALLOW_IMAGE_EXT, ...ALLOW_VIDEO_EXT];

export const getUploadUrlRequestSchema = z.object({
	ext: z.enum(ALLOWED_EXTENSIONS, 'Недопустимое расширение файла. Разрешены: ' + ALLOWED_EXTENSIONS.join(', ')),
	type: z.enum(['image', 'video'], {
		error: () => ({ message: 'Тип загрузки должен быть image или video' })
	}),
	space: z.enum(['posts', 'users', 'animals'], {
		error: () => ({ message: 'Тип загрузки должен быть posts, users или animals' })
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
