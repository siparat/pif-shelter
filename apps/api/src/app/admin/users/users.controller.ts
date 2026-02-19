import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CreateInvitationRequestDto, CreateInvitationResponseDto, ReturnDto } from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { Roles } from '../../core/decorators/roles.decorator';
import { RoleGuard } from '../../core/guards/role.guard';
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
}
