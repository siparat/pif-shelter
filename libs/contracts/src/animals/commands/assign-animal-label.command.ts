import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const assignAnimalLabelRequestSchema = z.object({
	labelId: z.uuid().describe('ID ярлыка для привязки')
});

export class AssignAnimalLabelRequestDto extends createZodDto(assignAnimalLabelRequestSchema) {}

export const assignAnimalLabelResponseSchema = createApiSuccessResponseSchema(
	z.object({
		labelId: z.uuid().describe('ID ярлыка для привязки'),
		animalId: z.uuid().describe('ID животного для привязки')
	})
);

export class AssignAnimalLabelResponseDto extends createZodDto(assignAnimalLabelResponseSchema) {}
