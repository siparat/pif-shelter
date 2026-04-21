import { MaxPostMediaItems, POST_ALLOWED_TAGS, PostMediaTypeEnum, PostVisibilityEnum } from '@pif/shared';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const postMediaItemSchema = z.object({
	storageKey: z.string().trim().min(1, 'Укажите ключ медиа').describe('Ключ файла в хранилище'),
	type: z.enum(PostMediaTypeEnum, 'Укажите тип медиа').describe('Тип медиа'),
	order: z.number().int().min(0).describe('Порядок отображения')
});

export const mediaArraySchema = z
	.array(postMediaItemSchema)
	.max(MaxPostMediaItems.ALL, `Не более ${MaxPostMediaItems.ALL} медиа на пост`)
	.refine(
		(items) => items.filter((i) => i.type === 'video').length <= MaxPostMediaItems.VIDEO,
		`Допускается не более ${MaxPostMediaItems.VIDEO} видео на пост`
	);

export const createPostRequestSchema = z.object({
	animalId: z.uuid('Некорректный идентификатор животного').describe('ID животного'),
	title: z
		.string('Укажите заголовок')
		.trim()
		.min(1, 'Заголовок не может быть пустым')
		.max(200, { message: 'Заголовок не может быть длиннее 200 символов' })
		.describe('Заголовок поста'),
	body: z
		.string('Укажите текст поста')
		.trim()
		.min(1, 'Текст поста не может быть пустым')
		.max(50000, { message: 'Текст поста не может быть длиннее 50000 символов' })
		.transform((html) => sanitizeHtml(html, { allowedTags: POST_ALLOWED_TAGS }))
		.describe('Текст поста (HTML)'),
	visibility: z.enum(PostVisibilityEnum).default(PostVisibilityEnum.PUBLIC).describe('Видимость поста'),
	media: mediaArraySchema.describe(
		`Медиа поста (до ${MaxPostMediaItems.ALL} элементов, не более ${MaxPostMediaItems.VIDEO} видео)`
	)
});

export const createPostResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid().describe('Идентификатор созданного поста')
	})
);
