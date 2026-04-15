import { z } from 'zod';

export type ReturnData<T extends { data: unknown } | { schema: z.ZodTypeAny }> = T extends { data: infer D }
	? D
	: T extends { schema: infer S }
		? S extends z.ZodTypeAny
			? z.infer<S> extends { data: infer D }
				? D
				: never
			: never
		: never;
