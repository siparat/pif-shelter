import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { createAnimalRequestSchema } from './create-animal.command';

export const updateAnimalRequestSchema = createAnimalRequestSchema.partial();
export class UpdateAnimalRequestDto extends createZodDto(updateAnimalRequestSchema) {}

export const updateAnimalResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid()
	})
);
export class UpdateAnimalResponseDto extends createZodDto(updateAnimalResponseSchema) {}
