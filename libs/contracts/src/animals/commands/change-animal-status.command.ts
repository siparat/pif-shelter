import { AnimalStatusEnum } from '@pif/shared';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const changeAnimalStatusRequestSchema = z.object({
	status: z.enum(AnimalStatusEnum).describe('Новый статус животного')
});

export class ChangeAnimalStatusRequestDto extends createZodDto(changeAnimalStatusRequestSchema) {}

export const changeAnimalStatusResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid(),
		status: z.enum(AnimalStatusEnum)
	})
);
export class ChangeAnimalStatusResponseDto extends createZodDto(changeAnimalStatusResponseSchema) {}
