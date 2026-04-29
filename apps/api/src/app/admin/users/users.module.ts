import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../../users/users.module';
import { AcceptInvitationHandler } from './commands/accept-invitation/accept-invitation.handler';
import { AcceptInvitationPolicy } from './commands/accept-invitation/accept-invitation.policy';
import { CreateInvitationHandler } from './commands/create-invitation/create-invitation.handler';
import { SetUserBannedHandler } from './commands/set-user-banned/set-user-banned.handler';
import { SetUserAvatarHandler } from './commands/set-user-avatar/set-user-avatar.handler';
import { SetUserAvatarPolicy } from './commands/set-user-avatar/set-user-avatar.policy';
import { SetUserProfileHandler } from './commands/set-user-profile/set-user-profile.handler';
import { SetUserProfilePolicy } from './commands/set-user-profile/set-user-profile.policy';
import { SetUserRoleHandler } from './commands/set-user-role/set-user-role.handler';
import { SetTelegramUnreachableHandler } from './commands/set-telegram-unreachable/set-telegram-unreachable.handler';
import { SendInvitationEmailHandler } from './events/invitation-created/send-invitation-email.handler';
import { GetAdminUserHandler } from './queries/get-admin-user/get-admin-user.handler';
import { ListPublicTeamUsersHandler } from './queries/list-public-team-users/list-public-team-users.handler';
import { ListTeamUsersHandler } from './queries/list-team-users/list-team-users.handler';
import { ListVolunteersHandler } from './queries/list-volunteers/list-volunteers.handler';
import { AdminUsersRepository } from './repositories/admin-users.repository';
import { DrizzleAdminUsersRepository } from './repositories/drizzle-admin-users.repository';
import { AdminUsersController } from './users.controller';

@Module({
	imports: [CqrsModule, UsersModule],
	controllers: [AdminUsersController],
	providers: [
		CreateInvitationHandler,
		AcceptInvitationHandler,
		SetTelegramUnreachableHandler,
		SetUserAvatarHandler,
		SetUserProfileHandler,
		SetUserBannedHandler,
		SetUserRoleHandler,
		SendInvitationEmailHandler,
		GetAdminUserHandler,
		ListPublicTeamUsersHandler,
		ListTeamUsersHandler,
		ListVolunteersHandler,
		AcceptInvitationPolicy,
		SetUserAvatarPolicy,
		SetUserProfilePolicy,
		{
			provide: AdminUsersRepository,
			useClass: DrizzleAdminUsersRepository
		}
	]
})
export class AdminUsersModule {}
