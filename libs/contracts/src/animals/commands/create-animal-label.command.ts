import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const createAnimalLabelRequestSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, 'Слишком короткое название')
		.max(50, 'Слишком длинное название')
		.describe('Название ярлыка'),
	color: z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Неправильный формат hex цвета')
});

export class CreateAnimalLabelRequestDto extends createZodDto(createAnimalLabelRequestSchema) {}

export const createAnimalLabelResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid().describe('ID созданного ярлыка')
	})
);

export class CreateAnimalLabelResponseDto extends createZodDto(createAnimalLabelResponseSchema) {}
