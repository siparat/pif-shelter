import { Module } from '@nestjs/common';
import { DrizzleUsersRepository } from './repositories/drizzle-users.repository';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';

@Module({
	providers: [
		UsersService,
		{
			provide: UsersRepository,
			useClass: DrizzleUsersRepository
		}
	],
	exports: [UsersService]
})
export class UsersModule {}
