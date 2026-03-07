import { Injectable } from '@nestjs/common';
import { users } from '@pif/database';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
	constructor(private readonly repository: UsersRepository) {}

	async findByTelegram(telegram: string): Promise<typeof users.$inferSelect | undefined> {
		return this.repository.findByTelegram(telegram);
	}

	async findByEmail(email: string): Promise<typeof users.$inferSelect | undefined> {
		return this.repository.findByEmail(email);
	}

	async findById(id: string): Promise<typeof users.$inferSelect | undefined> {
		return this.repository.findById(id);
	}

	async delete(id: string): Promise<void> {
		return this.repository.delete(id);
	}

	async setTelegramBotLinkToken(userId: string, token: string | null): Promise<void> {
		return this.repository.setTelegramBotLinkToken(userId, token);
	}
}
