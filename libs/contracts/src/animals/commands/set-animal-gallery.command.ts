import { ANIMAL_GALLERY_MAX } from '@pif/shared';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const setAnimalGalleryRequestSchema = z
	.object({
		galleryKeys: z
			.array(z.string().min(1).describe('Ключ медиа-файла в S3'))
			.max(ANIMAL_GALLERY_MAX, `Максимум ${ANIMAL_GALLERY_MAX} фото в галерее`)
			.describe('Полный упорядоченный массив ключей фото галереи (заменяет текущий)')
	})
	.superRefine((data, ctx) => {
		if (new Set(data.galleryKeys).size !== data.galleryKeys.length) {
			ctx.addIssue({
				code: 'custom',
				path: ['galleryKeys'],
				message: 'Ключи фото должны быть уникальными'
			});
		}
	});

export const setAnimalGalleryResponseSchema = createApiSuccessResponseSchema(
	z.object({
		animalId: z.uuid().describe('Уникальный идентификатор животного'),
		galleryUrls: z.array(z.string()).describe('Итоговый упорядоченный массив ключей фото галереи')
	})
);
