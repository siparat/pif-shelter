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

	async delete(id: string): Promise<void> {
		await this.db.client.delete(users).where(eq(users.id, id));
	}
}
