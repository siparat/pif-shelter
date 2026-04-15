import { PostMediaTypeEnum, PostVisibilityEnum } from '@pif/shared';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

const postMediaItemSchema = z.object({
	storageKey: z.string().trim().min(1, 'Укажите ключ медиа').describe('Ключ файла в хранилище'),
	type: z.enum(PostMediaTypeEnum, 'Укажите тип медиа').describe('Тип медиа'),
	order: z.number().int().min(0).describe('Порядок отображения')
});

const mediaArraySchema = z
	.array(postMediaItemSchema)
	.max(10, 'Не более 10 медиа на пост')
	.refine(
		(items) => items.filter((i) => i.type === 'video').length <= 1,
		'Допускается не более одного видео на пост'
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
		.transform((html) => sanitizeHtml(html, { allowedTags: ['b', 'i', 'u', 's', 'code', 'pre'] }))
		.describe('Текст поста (HTML)'),
	visibility: z.enum(PostVisibilityEnum).default(PostVisibilityEnum.PUBLIC).describe('Видимость поста'),
	media: mediaArraySchema.describe('Медиа поста (до 10 элементов, не более 1 видео)')
});

export const createPostResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid().describe('Идентификатор созданного поста')
	})
);
