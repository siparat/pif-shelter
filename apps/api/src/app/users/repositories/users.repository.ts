import { users } from '@pif/database';

export abstract class UsersRepository {
	abstract findByTelegram(telegram: string): Promise<typeof users.$inferSelect | undefined>;
	abstract findByEmail(email: string): Promise<typeof users.$inferSelect | undefined>;
	abstract findById(id: string): Promise<typeof users.$inferSelect | undefined>;
	abstract delete(id: string): Promise<void>;
}
