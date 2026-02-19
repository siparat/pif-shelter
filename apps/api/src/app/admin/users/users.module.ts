import { Module } from '@nestjs/common';
import { CreateInvitationHandler } from './commands/create-invitation/create-invitation.handler';
import { AdminUsersRepository } from './repositories/admin-users.repository';
import { DrizzleAdminUsersRepository } from './repositories/drizzle-admin-users.repository';
import { AdminUsersController } from './users.controller';
import { SendInvitationEmailHandler } from './events/invitation-created/send-invitation-email.handler';
import { UsersModule } from '../../users/users.module';

@Module({
	imports: [UsersModule],
	controllers: [AdminUsersController],
	providers: [
		CreateInvitationHandler,
		SendInvitationEmailHandler,
		{
			provide: AdminUsersRepository,
			useClass: DrizzleAdminUsersRepository
		}
	]
})
export class AdminUsersModule {}
