import { Injectable } from '@nestjs/common';
import { DatabaseService, users } from '@pif/database';
import { eq } from 'drizzle-orm';
import { UsersRepository } from './users.repository';

@Injectable()
export class DrizzleUsersRepository implements UsersRepository {
	constructor(private readonly db: DatabaseService) {}

	async findByTelegram(telegram: string): Promise<typeof users.$inferSelect | undefined> {
		const [user] = await this.db.client.select().from(users).where(eq(users.telegram, telegram)).limit(1);
		return user;
	}

	async findByEmail(email: string): Promise<typeof users.$inferSelect | undefined> {
		const [user] = await this.db.client.select().from(users).where(eq(users.email, email)).limit(1);
		return user;
	}

	async findById(id: string): Promise<typeof users.$inferSelect | undefined> {
		const [user] = await this.db.client.select().from(users).where(eq(users.id, id)).limit(1);
		return user;
	}

	async findByTelegramBotLinkToken(token: string): Promise<typeof users.$inferSelect | undefined> {
		const [user] = await this.db.client.select().from(users).where(eq(users.telegramBotLinkToken, token)).limit(1);
		return user;
	}

	async findByTelegramChatId(telegramChatId: string): Promise<typeof users.$inferSelect | undefined> {
		const [user] = await this.db.client
			.select()
			.from(users)
			.where(eq(users.telegramChatId, telegramChatId))
			.limit(1);
		return user;
	}

	async delete(id: string): Promise<void> {
		await this.db.client.delete(users).where(eq(users.id, id));
	}

	async setTelegramBotLinkToken(userId: string, token: string | null): Promise<void> {
		await this.db.client.update(users).set({ telegramBotLinkToken: token }).where(eq(users.id, userId));
	}

	async linkTelegramChat(userId: string, telegramChatId: string): Promise<void> {
		const now = new Date();
		await this.db.client
			.update(users)
			.set({
				telegramChatId: String(telegramChatId),
				telegramChatIdUpdatedAt: now,
				telegramBotLinkToken: null
			})
			.where(eq(users.id, userId));
	}

	async setTelegramUnreachable(userId: string, value: boolean): Promise<void> {
		await this.db.client.update(users).set({ telegramUnreachable: value }).where(eq(users.id, userId));
	}

	async setBanned(userId: string, value: boolean): Promise<void> {
		await this.db.client.update(users).set({ banned: value }).where(eq(users.id, userId));
	}
}
