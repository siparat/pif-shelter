import { z } from 'zod';

export const linkTelegramByTokenRequestSchema = z.object({
	token: z.uuid().describe('Одноразовый токен из ссылки'),
	chatId: z.string().describe('Telegram chat id (из update)'),
	telegramUsername: z.string().describe('Username из Telegram (from.username, без @)')
});

export type LinkTelegramByTokenRequest = z.infer<typeof linkTelegramByTokenRequestSchema>;

export enum LinkTelegramResult {
	SUCCESS = 'SUCCESS',
	ALREADY_USED = 'ALREADY_USED',
	USERNAME_MISMATCH = 'USERNAME_MISMATCH'
}
