import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DrizzleUsersRepository } from './repositories/drizzle-users.repository';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';
import { SendTelegramUnreachableEmailHandler } from './events/telegram-unreachable/send-telegram-unreachable-email.handler';

@Module({
	imports: [CqrsModule],
	providers: [
		UsersService,
		SendTelegramUnreachableEmailHandler,
		{
			provide: UsersRepository,
			useClass: DrizzleUsersRepository
		}
	],
	exports: [UsersService]
})
export class UsersModule {}
