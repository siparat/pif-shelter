import { Injectable } from '@nestjs/common';
import { DatabaseService, User, users } from '@pif/database';
import { eq } from 'drizzle-orm';
import { UsersRepository } from './users.repository';

@Injectable()
export class DrizzleUsersRepository implements UsersRepository {
	constructor(private readonly db: DatabaseService) {}

	async findByEmail(email: string): Promise<User | undefined> {
		const [user] = await this.db.client.select().from(users).where(eq(users.email, email)).limit(1);
		return user;
	}

	async findById(id: string): Promise<User | undefined> {
		const [user] = await this.db.client.select().from(users).where(eq(users.id, id)).limit(1);
		return user;
	}
}
