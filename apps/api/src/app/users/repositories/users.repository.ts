import { User } from '@pif/database';

export abstract class UsersRepository {
	abstract findByEmail(email: string): Promise<User | undefined>;
	abstract findById(id: string): Promise<User | undefined>;
}
