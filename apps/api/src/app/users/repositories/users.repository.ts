import { users } from '@pif/database';

export abstract class UsersRepository {
	abstract findByTelegram(telegram: string): Promise<typeof users.$inferSelect | undefined>;
	abstract findByEmail(email: string): Promise<typeof users.$inferSelect | undefined>;
	abstract findById(id: string): Promise<typeof users.$inferSelect | undefined>;
	abstract findByTelegramBotLinkToken(token: string): Promise<typeof users.$inferSelect | undefined>;
	abstract findByTelegramChatId(telegramChatId: string): Promise<typeof users.$inferSelect | undefined>;
	abstract delete(id: string): Promise<void>;
	abstract setTelegramBotLinkToken(userId: string, token: string | null): Promise<void>;
	abstract linkTelegramChat(userId: string, telegramChatId: string): Promise<void>;
	abstract setTelegramUnreachable(userId: string, value: boolean): Promise<void>;
	abstract setBanned(userId: string, value: boolean): Promise<void>;
}
