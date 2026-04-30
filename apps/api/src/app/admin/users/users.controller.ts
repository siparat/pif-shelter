import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@pif/shared';
import { AllowAnonymous, AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { ISession } from '../../configs/auth.config';
import { Roles } from '../../core/decorators/roles.decorator';
import {
	AcceptInvitationRequestDto,
	AcceptInvitationResponseDto,
	CreateInvitationRequestDto,
	CreateInvitationResponseDto,
	GetAdminUserResponseDto,
	ListPublicTeamUsersResponseDto,
	ListTeamUsersQueryDto,
	ListTeamUsersResponseDto,
	ListVolunteersResponseDto,
	ReturnData,
	SetTelegramUnreachableRequestDto,
	SetTelegramUnreachableResponseDto,
	SetUserAvatarRequestDto,
	SetUserAvatarResponseDto,
	SetUserBannedRequestDto,
	SetUserBannedResponseDto,
	SetUserProfileRequestDto,
	SetUserProfileResponseDto,
	SetUserRoleRequestDto,
	SetUserRoleResponseDto
} from '../../core/dto';
import { RoleGuard } from '../../core/guards/role.guard';
import { AcceptInvitationCommand } from './commands/accept-invitation/accept-invitation.command';
import { CreateInvitationCommand } from './commands/create-invitation/create-invitation.command';
import { SetTelegramUnreachableCommand } from './commands/set-telegram-unreachable/set-telegram-unreachable.command';
import { SetUserAvatarCommand } from './commands/set-user-avatar/set-user-avatar.command';
import { SetUserBannedCommand } from './commands/set-user-banned/set-user-banned.command';
import { SetUserProfileCommand } from './commands/set-user-profile/set-user-profile.command';
import { SetUserRoleCommand } from './commands/set-user-role/set-user-role.command';
import { GetAdminUserQuery } from './queries/get-admin-user/get-admin-user.query';
import { ListPublicTeamUsersQuery } from './queries/list-public-team-users/list-public-team-users.query';
import { ListTeamUsersQuery } from './queries/list-team-users/list-team-users.query';
import { ListVolunteersQuery } from './queries/list-volunteers/list-volunteers.query';

@ApiTags('Admin Users | Пользователи в админ-панели')
@UseGuards(AuthGuard, RoleGuard)
@Controller('admin/users')
export class AdminUsersController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@ApiOperation({ summary: 'Создать приглашение в команду' })
	@ApiCreatedResponse({ description: 'Приглашение создано', type: CreateInvitationResponseDto })
	@Roles([UserRole.ADMIN])
	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Post('invite')
	async invite(@Body() dto: CreateInvitationRequestDto): Promise<ReturnData<typeof CreateInvitationResponseDto>> {
		return this.commandBus.execute(new CreateInvitationCommand(dto));
	}

	@ApiOperation({ summary: 'Принять приглашение в команду' })
	@ApiOkResponse({ description: 'Аккаунт зарегистрирован', type: AcceptInvitationResponseDto })
	@AllowAnonymous()
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Post('accept-invitation')
	async acceptInvitation(
		@Body() dto: AcceptInvitationRequestDto
	): Promise<ReturnData<typeof AcceptInvitationResponseDto>> {
		return this.commandBus.execute(new AcceptInvitationCommand(dto));
	}

	@ApiOperation({ summary: 'Установить или снять флаг telegram_unreachable' })
	@ApiOkResponse({ description: 'Флаг обновлён', type: SetTelegramUnreachableResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Patch(':userId/telegram-unreachable')
	async setTelegramUnreachable(
		@Param('userId') userId: string,
		@Body() dto: SetTelegramUnreachableRequestDto
	): Promise<ReturnData<typeof SetTelegramUnreachableResponseDto>> {
		return this.commandBus.execute(new SetTelegramUnreachableCommand(userId, dto.unreachable));
	}

	@ApiOperation({ summary: 'Установить аватарку волонтёра' })
	@ApiOkResponse({ description: 'Аватарка обновлена', type: SetUserAvatarResponseDto })
	@Roles([UserRole.ADMIN])
	@Patch(':userId/avatar')
	async setAvatar(
		@Param('userId') userId: string,
		@Body() dto: SetUserAvatarRequestDto
	): Promise<ReturnData<typeof SetUserAvatarResponseDto>> {
		return this.commandBus.execute(new SetUserAvatarCommand(userId, dto.avatarKey));
	}

	@ApiOperation({ summary: 'Обновить имя, email, должность и telegram пользователя' })
	@ApiOkResponse({ description: 'Профиль обновлён', type: SetUserProfileResponseDto })
	@Roles([UserRole.ADMIN])
	@Patch(':userId/profile')
	async setProfile(
		@Param('userId') userId: string,
		@Body() dto: SetUserProfileRequestDto
	): Promise<ReturnData<typeof SetUserProfileResponseDto>> {
		return this.commandBus.execute(
			new SetUserProfileCommand(userId, dto.name, dto.email, dto.position, dto.telegram)
		);
	}

	@ApiOperation({ summary: 'Публичный список команды приюта' })
	@ApiOkResponse({ description: 'Список участников команды', type: ListPublicTeamUsersResponseDto })
	@AllowAnonymous()
	@Get('public')
	async listPublicTeamUsers(): Promise<ReturnData<typeof ListPublicTeamUsersResponseDto>> {
		return this.queryBus.execute(new ListPublicTeamUsersQuery());
	}

	@ApiOperation({ summary: 'Получить список волонтёров' })
	@ApiOkResponse({ description: 'Список волонтёров', type: ListVolunteersResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER, UserRole.VOLUNTEER])
	@Get('volunteers')
	async listVolunteers(): Promise<ReturnData<typeof ListVolunteersResponseDto>> {
		return this.queryBus.execute(new ListVolunteersQuery());
	}

	@ApiOperation({ summary: 'Получить список пользователей команды' })
	@ApiOkResponse({ description: 'Список пользователей команды', type: ListTeamUsersResponseDto })
	@Roles([UserRole.ADMIN])
	@Get()
	async listTeamUsers(@Query() dto: ListTeamUsersQueryDto): Promise<ReturnData<typeof ListTeamUsersResponseDto>> {
		return this.queryBus.execute(new ListTeamUsersQuery(dto.includeGuardians));
	}

	@ApiOperation({ summary: 'Карточка пользователя (для админки)' })
	@ApiOkResponse({ description: 'Пользователь', type: GetAdminUserResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Get(':userId')
	async getUser(@Param('userId') userId: string): Promise<ReturnData<typeof GetAdminUserResponseDto>> {
		return this.queryBus.execute(new GetAdminUserQuery(userId));
	}

	@ApiOperation({ summary: 'Заблокировать или разблокировать вход в систему' })
	@ApiOkResponse({ description: 'Статус блокировки обновлён', type: SetUserBannedResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Patch(':userId/banned')
	async setBanned(
		@Param('userId') userId: string,
		@Body() dto: SetUserBannedRequestDto,
		@Session() { user }: ISession
	): Promise<ReturnData<typeof SetUserBannedResponseDto>> {
		return this.commandBus.execute(new SetUserBannedCommand(userId, dto.banned, user.id, user.role as UserRole));
	}

	@ApiOperation({ summary: 'Повысить или понизить роль пользователя команды' })
	@ApiOkResponse({ description: 'Роль обновлена', type: SetUserRoleResponseDto })
	@Roles([UserRole.ADMIN])
	@Patch(':userId/role')
	async setRole(
		@Param('userId') userId: string,
		@Body() dto: SetUserRoleRequestDto,
		@Session() { user }: ISession
	): Promise<ReturnData<typeof SetUserRoleResponseDto>> {
		return this.commandBus.execute(new SetUserRoleCommand(userId, dto.roleName, user.id));
	}
}
