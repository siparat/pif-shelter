import { User } from '@pif/database';

export abstract class UsersRepository {
	abstract findByTelegram(telegram: string): Promise<User | undefined>;
	abstract findByEmail(email: string): Promise<User | undefined>;
	abstract findById(id: string): Promise<User | undefined>;
	abstract delete(id: string): Promise<void>;
}
