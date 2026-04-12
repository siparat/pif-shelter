import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common';
import { blacklistSourceSchema } from './blacklist-source.schema';

export const approveContactsRequestSchema = z.object({
	sources: z.array(blacklistSourceSchema).min(1)
});

export class ApproveContactsRequestDto extends createZodDto(approveContactsRequestSchema) {}

export const approveContactsResponseSchema = createApiSuccessResponseSchema(
	z.object({
		updated: z.number().int().nonnegative()
	})
);

export class ApproveContactsResponseDto extends createZodDto(approveContactsResponseSchema) {}
