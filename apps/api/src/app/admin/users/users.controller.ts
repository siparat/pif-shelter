import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@pif/shared';
import { AllowAnonymous, AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import {
	AcceptInvitationRequestDto,
	AcceptInvitationResponseDto,
	CreateInvitationRequestDto,
	CreateInvitationResponseDto,
	GetAdminUserResponseDto,
	ListVolunteersResponseDto,
	ReturnData,
	SetTelegramUnreachableRequestDto,
	SetTelegramUnreachableResponseDto,
	SetUserBannedRequestDto,
	SetUserBannedResponseDto
} from '../../core/dto';
import { ISession } from '../../configs/auth.config';
import { Roles } from '../../core/decorators/roles.decorator';
import { RoleGuard } from '../../core/guards/role.guard';
import { AcceptInvitationCommand } from './commands/accept-invitation/accept-invitation.command';
import { CreateInvitationCommand } from './commands/create-invitation/create-invitation.command';
import { SetUserBannedCommand } from './commands/set-user-banned/set-user-banned.command';
import { SetTelegramUnreachableCommand } from './commands/set-telegram-unreachable/set-telegram-unreachable.command';
import { GetAdminUserQuery } from './queries/get-admin-user/get-admin-user.query';
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

	@ApiOperation({ summary: 'Получить список волонтёров' })
	@ApiOkResponse({ description: 'Список волонтёров', type: ListVolunteersResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Get('volunteers')
	async listVolunteers(): Promise<ReturnData<typeof ListVolunteersResponseDto>> {
		return this.queryBus.execute(new ListVolunteersQuery());
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
}
