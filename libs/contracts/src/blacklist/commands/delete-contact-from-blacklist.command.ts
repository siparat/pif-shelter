import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const deleteContactFromBlacklistResponseSchema = createApiSuccessResponseSchema(
	z.object({
		ok: z.boolean()
	})
);

export class DeleteContactFromBlacklistResponseDto extends createZodDto(deleteContactFromBlacklistResponseSchema) {}
