import { Module } from '@nestjs/common';
import { UsersModule } from '../../users/users.module';
import { AcceptInvitationHandler } from './commands/accept-invitation/accept-invitation.handler';
import { AcceptInvitationPolicy } from './commands/accept-invitation/accept-invitation.policy';
import { CreateInvitationHandler } from './commands/create-invitation/create-invitation.handler';
import { SendInvitationEmailHandler } from './events/invitation-created/send-invitation-email.handler';
import { AdminUsersRepository } from './repositories/admin-users.repository';
import { DrizzleAdminUsersRepository } from './repositories/drizzle-admin-users.repository';
import { AdminUsersController } from './users.controller';

@Module({
	imports: [UsersModule],
	controllers: [AdminUsersController],
	providers: [
		CreateInvitationHandler,
		AcceptInvitationHandler,
		SendInvitationEmailHandler,
		AcceptInvitationPolicy,
		{
			provide: AdminUsersRepository,
			useClass: DrizzleAdminUsersRepository
		}
	]
})
export class AdminUsersModule {}
