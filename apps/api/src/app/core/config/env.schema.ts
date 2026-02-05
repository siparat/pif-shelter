import { z } from 'zod';

export const envSchema = z.object({
	PORT: z.coerce.number().default(3000),
	DATABASE_URL: z.url(),
	JWT_SECRET: z.string().min(8),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

export type Env = z.infer<typeof envSchema>;
