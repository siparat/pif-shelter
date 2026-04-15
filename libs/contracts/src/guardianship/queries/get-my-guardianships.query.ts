import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common';
import { guardianshipWithAnimalSchema } from '../../common/schemas';

export const getMyGaurdianshipsResponseSchema = createApiSuccessResponseSchema(
	z.object({
		guardianships: z
			.array(guardianshipWithAnimalSchema)
			.describe(
				'Опекунства с портальным доступом: ACTIVE и CANCELLED с действующим guardianPrivilegesUntil; paidPeriodEndAt — конец оплаченного периода'
			)
	})
);
