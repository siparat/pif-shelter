import { ZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiPaginatedResponseSchema, createApiSuccessResponseSchema } from './base.responses';

export type ReturnDto<
	T extends ZodDto<ReturnType<typeof createApiSuccessResponseSchema | typeof createApiPaginatedResponseSchema>>
> = z.infer<T['schema']>['data'];
