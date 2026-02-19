import { z } from 'zod';

export const envSchema = z.object({
	DATABASE_URL: z.url(),
	SECRET: z.string().min(8),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3001'),
	ADMIN_EMAIL: z.email(),
	ADMIN_PASSWORD: z.string().min(8),
	BASE_URL: z.url(),
	APP_BASE_URL: z.url(),
	SMTP_PASSWORD: z.string(),
	SMTP_HOST: z.string(),
	SMTP_PORT: z.coerce.number(),
	SMTP_EMAIL: z.email(),
	SMTP_NAME: z.string(),
	HEALTH_DISK_THRESHOLD_PERCENT: z.coerce.number(),
	HEALTH_MEMORY_THRESHOLD_BYTES: z.coerce.number()
});

export type Env = z.infer<typeof envSchema>;
