import { z } from 'zod';

export const envSchema = z.object({
	DATABASE_URL: z.url(),
	JWT_SECRET: z.string().min(8),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

export type Env = z.infer<typeof envSchema>;
