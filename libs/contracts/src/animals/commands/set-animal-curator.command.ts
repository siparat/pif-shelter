import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const setAnimalCuratorRequestSchema = z.object({
	curatorId: z
		.string('Неверный формат идентификатора куратора')
		.nullable()
		.describe('Идентификатор пользователя-куратора или null для снятия куратора')
});

export class SetAnimalCuratorRequestDto extends createZodDto(setAnimalCuratorRequestSchema) {}

export const setAnimalCuratorResponseSchema = createApiSuccessResponseSchema(
	z.object({
		animalId: z.uuid().describe('Идентификатор животного'),
		curatorId: z.uuid().nullable().describe('Идентификатор назначенного куратора или null')
	})
);

export class SetAnimalCuratorResponseDto extends createZodDto(setAnimalCuratorResponseSchema) {}
