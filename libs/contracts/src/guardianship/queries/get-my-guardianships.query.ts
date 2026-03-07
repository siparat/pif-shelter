import { guardianshipWithAnimalSchema } from '@pif/database';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common';

export const getMyGaurdianshipsResponseSchema = createApiSuccessResponseSchema(
	z.object({
		guardianships: z.array(guardianshipWithAnimalSchema).describe('Список опекунств')
	})
);

export class GetMyGaurdianshipsResponseDto extends createZodDto(getMyGaurdianshipsResponseSchema) {}
