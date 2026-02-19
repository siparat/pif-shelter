import { Injectable } from '@nestjs/common';
import { User } from '@pif/database';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
	constructor(private readonly repository: UsersRepository) {}

	async findByEmail(email: string): Promise<User | undefined> {
		return this.repository.findByEmail(email);
	}

	async findById(id: string): Promise<User | undefined> {
		return this.repository.findById(id);
	}
}
