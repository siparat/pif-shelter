import { z } from 'zod';

export const envSchema = z.object({
	DATABASE_URL: z.url(),
	JWT_SECRET: z.string().min(8),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3001')
});

export type Env = z.infer<typeof envSchema>;
