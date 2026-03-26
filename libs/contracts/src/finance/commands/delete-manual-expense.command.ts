import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const deleteManualExpenseRequestSchema = z.object({
	id: z.uuid()
});

export class DeleteManualExpenseRequestDto extends createZodDto(deleteManualExpenseRequestSchema) {}

export const deleteManualExpenseResponseSchema = createApiSuccessResponseSchema(
	z.object({
		success: z.literal(true)
	})
);

export class DeleteManualExpenseResponseDto extends createZodDto(deleteManualExpenseResponseSchema) {}
