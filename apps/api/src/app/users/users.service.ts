import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { users } from '@pif/database';
import { UserRole } from '@pif/shared';
import { UsersRepository } from './repositories/users.repository';
import { UserTelegramUnreachableEvent } from './events/telegram-unreachable/telegram-unreachable.event';

@Injectable()
export class UsersService {
	constructor(
		private readonly repository: UsersRepository,
		private readonly eventBus: EventBus
	) {}

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

	async findByTelegramChatId(telegramChatId: string): Promise<typeof users.$inferSelect | undefined> {
		return this.repository.findByTelegramChatId(telegramChatId);
	}

	async setTelegramUnreachable(userId: string, value: boolean): Promise<void> {
		await this.repository.setTelegramUnreachable(userId, value);
		if (value) {
			this.eventBus.publish(new UserTelegramUnreachableEvent(userId));
		}
	}

	async setBanned(userId: string, value: boolean): Promise<void> {
		await this.repository.setBanned(userId, value);
	}

	async setRole(userId: string, roleName: UserRole): Promise<void> {
		await this.repository.setRole(userId, roleName);
	}

	async findByTelegramBotLinkToken(token: string): Promise<typeof users.$inferSelect | undefined> {
		return this.repository.findByTelegramBotLinkToken(token);
	}

	async linkTelegramChat(userId: string, telegramChatId: string): Promise<void> {
		return this.repository.linkTelegramChat(userId, telegramChatId);
	}
}
