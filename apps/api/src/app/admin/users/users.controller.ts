import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
	AcceptInvitationRequestDto,
	AcceptInvitationResponseDto,
	CreateInvitationRequestDto,
	CreateInvitationResponseDto,
	ReturnDto
} from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AllowAnonymous, AuthGuard } from '@thallesp/nestjs-better-auth';
import { Roles } from '../../core/decorators/roles.decorator';
import { RoleGuard } from '../../core/guards/role.guard';
import { AcceptInvitationCommand } from './commands/accept-invitation/accept-invitation.command';
import { CreateInvitationCommand } from './commands/create-invitation/create-invitation.command';

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
}
