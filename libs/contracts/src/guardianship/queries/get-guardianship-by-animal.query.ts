import { guardianshipSchema } from '@pif/database';
import { GuardianshipStatusEnum } from '@pif/shared';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const getGuardianshipByAnimalRequestSchema = z.object({
	animalId: z.uuid().describe('Уникальный идентификатор животного, для которого нужно получить опекунство')
});

export class GetGuardianshipByAnimalRequestDto extends createZodDto(getGuardianshipByAnimalRequestSchema) {}

export const guardianshipViewSchema = guardianshipSchema
	.extend({
		status: z.enum(GuardianshipStatusEnum)
	})
	.describe('Данные об опекунстве для карточки животного');

export const getGuardianshipByAnimalResponseSchema = createApiSuccessResponseSchema(
	guardianshipViewSchema.nullable().describe('Текущая запись опекунства или null, если опекунства нет')
);

export class GetGuardianshipByAnimalResponseDto extends createZodDto(getGuardianshipByAnimalResponseSchema) {}
