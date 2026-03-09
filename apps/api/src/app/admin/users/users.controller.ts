import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
	AcceptInvitationRequestDto,
	AcceptInvitationResponseDto,
	CreateInvitationRequestDto,
	CreateInvitationResponseDto,
	ReturnDto,
	SetTelegramUnreachableRequestDto,
	SetTelegramUnreachableResponseDto
} from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AllowAnonymous, AuthGuard } from '@thallesp/nestjs-better-auth';
import { Roles } from '../../core/decorators/roles.decorator';
import { RoleGuard } from '../../core/guards/role.guard';
import { AcceptInvitationCommand } from './commands/accept-invitation/accept-invitation.command';
import { CreateInvitationCommand } from './commands/create-invitation/create-invitation.command';
import { SetTelegramUnreachableCommand } from './commands/set-telegram-unreachable/set-telegram-unreachable.command';

@ApiTags('Admin Users | Пользователи в админ-панели')
@UseGuards(AuthGuard, RoleGuard)
@Controller('admin/users')
export class AdminUsersController {
	constructor(private readonly commandBus: CommandBus) {}

	@ApiOperation({ summary: 'Создать приглашение в команду' })
	@ApiCreatedResponse({ description: 'Приглашение создано', type: CreateInvitationResponseDto })
	@Roles([UserRole.ADMIN])
	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Post('invite')
	async invite(@Body() dto: CreateInvitationRequestDto): Promise<ReturnDto<typeof CreateInvitationResponseDto>> {
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
	): Promise<ReturnDto<typeof AcceptInvitationResponseDto>> {
		return this.commandBus.execute(new AcceptInvitationCommand(dto));
	}

	@ApiOperation({ summary: 'Установить или снять флаг telegram_unreachable' })
	@ApiOkResponse({ description: 'Флаг обновлён', type: SetTelegramUnreachableResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Patch(':userId/telegram-unreachable')
	async setTelegramUnreachable(
		@Param('userId') userId: string,
		@Body() dto: SetTelegramUnreachableRequestDto
	): Promise<ReturnDto<typeof SetTelegramUnreachableResponseDto>> {
		return this.commandBus.execute(new SetTelegramUnreachableCommand(userId, dto.unreachable));
	}
}
