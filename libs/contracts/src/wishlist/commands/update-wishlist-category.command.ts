import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const updateWishlistCategoryRequestSchema = z.object({
	name: z.string().trim().min(1).max(200).optional().describe('Название категории'),
	sortOrder: z.number().int().optional().describe('Порядок сортировки')
});

export class UpdateWishlistCategoryRequestDto extends createZodDto(updateWishlistCategoryRequestSchema) {}

export const updateWishlistCategoryResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid().describe('Идентификатор категории')
	})
);

export class UpdateWishlistCategoryResponseDto extends createZodDto(updateWishlistCategoryResponseSchema) {}
