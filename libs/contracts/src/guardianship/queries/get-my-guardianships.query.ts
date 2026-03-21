import { guardianshipWithAnimalSchema } from '@pif/database';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common';

export const getMyGaurdianshipsResponseSchema = createApiSuccessResponseSchema(
	z.object({
		guardianships: z
			.array(guardianshipWithAnimalSchema)
			.describe(
				'Опекунства с портальным доступом: ACTIVE и CANCELLED с действующим guardianPrivilegesUntil; paidPeriodEndAt — конец оплаченного периода'
			)
	})
);

export class GetMyGaurdianshipsResponseDto extends createZodDto(getMyGaurdianshipsResponseSchema) {}
