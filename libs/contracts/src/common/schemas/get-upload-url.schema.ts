import { ALLOW_IMAGE_EXT, ALLOW_VIDEO_EXT, UPLOAD_SPACE, UPLOAD_TYPE } from '@pif/shared';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../base.responses';

const ALLOWED_EXTENSIONS = [...ALLOW_IMAGE_EXT, ...ALLOW_VIDEO_EXT];

export const getUploadUrlRequestSchema = z
	.object({
		ext: z.enum(ALLOWED_EXTENSIONS, {
			message: 'Недопустимое расширение файла. Разрешены: ' + ALLOWED_EXTENSIONS.join(', ')
		}),
		type: z.enum(UPLOAD_TYPE, {
			error: () => ({ message: 'Тип загрузки должен быть image или video' })
		}),
		space: z.enum(UPLOAD_SPACE, {
			error: () => ({
				message: 'Пространство загрузки должно быть posts, users, animals, campaigns или ledger_receipts'
			})
		})
	})
	.refine(
		(data) => (data.type === 'image' ? ALLOW_IMAGE_EXT.includes(data.ext) : ALLOW_VIDEO_EXT.includes(data.ext)),
		{
			message:
				'Расширение файла не соответствует типу загрузки (image: ' +
				ALLOW_IMAGE_EXT.join(', ') +
				'; video: ' +
				ALLOW_VIDEO_EXT.join(', ') +
				')',
			path: ['ext']
		}
	);

export class GetUploadUrlRequestDto extends createZodDto(getUploadUrlRequestSchema) {}

export const getUploadUrlResponseSchema = createApiSuccessResponseSchema(
	z.object({
		url: z.string(),
		fields: z.record(z.string(), z.string()),
		key: z.string()
	})
);

export class GetUploadUrlResponseDto extends createZodDto(getUploadUrlResponseSchema) {}
