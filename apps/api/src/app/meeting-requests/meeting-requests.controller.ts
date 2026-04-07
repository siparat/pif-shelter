import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	ConfirmMeetingRequestResponseDto,
	CreateMeetingRequestDto,
	CreateMeetingRequestResponseDto,
	GetMeetingRequestByIdResponseDto,
	ListCuratorMeetingRequestsQueryDto,
	ListCuratorMeetingRequestsResponseDto,
	RejectMeetingRequestDto,
	RejectMeetingRequestResponseDto,
	ReturnDto
} from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { ISession } from '../configs/auth.config';
import { Roles } from '../core/decorators/roles.decorator';
import { RoleGuard } from '../core/guards/role.guard';
import { ConfirmMeetingRequestCommand } from './commands/confirm-meeting-request/confirm-meeting-request.command';
import { CreateMeetingRequestCommand } from './commands/create-meeting-request/create-meeting-request.command';
import { RejectMeetingRequestCommand } from './commands/reject-meeting-request/reject-meeting-request.command';
import { GetMeetingRequestByIdQuery } from './queries/get-meeting-request-by-id/get-meeting-request-by-id.query';
import { ListCuratorMeetingRequestsQuery } from './queries/list-curator-meeting-requests/list-curator-meeting-requests.query';

@ApiTags('Meeting Requests | Запись на встречу')
@Controller('meeting-requests')
export class MeetingRequestsController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@ApiOperation({ summary: 'Создать заявку на знакомство' })
	@ApiCreatedResponse({ type: CreateMeetingRequestResponseDto })
	@Post()
	async create(@Body() dto: CreateMeetingRequestDto): Promise<ReturnDto<typeof CreateMeetingRequestResponseDto>> {
		return this.commandBus.execute(new CreateMeetingRequestCommand(dto));
	}

	@ApiOperation({ summary: 'Список заявок куратора' })
	@ApiOkResponse({ type: ListCuratorMeetingRequestsResponseDto })
	@Roles([UserRole.VOLUNTEER, UserRole.SENIOR_VOLUNTEER, UserRole.ADMIN])
	@UseGuards(AuthGuard, RoleGuard)
	@Get('curator')
	async listCurator(
		@Query() dto: ListCuratorMeetingRequestsQueryDto,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof ListCuratorMeetingRequestsResponseDto>> {
		return this.queryBus.execute(new ListCuratorMeetingRequestsQuery(dto, user.id));
	}

	@ApiOperation({ summary: 'Заявка по id для куратора' })
	@ApiOkResponse({ type: GetMeetingRequestByIdResponseDto })
	@Roles([UserRole.VOLUNTEER, UserRole.SENIOR_VOLUNTEER, UserRole.ADMIN])
	@UseGuards(AuthGuard, RoleGuard)
	@Get(':id')
	async getById(
		@Param('id', ParseUUIDPipe) id: string,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof GetMeetingRequestByIdResponseDto>> {
		return this.queryBus.execute(new GetMeetingRequestByIdQuery(id, user.id));
	}

	@ApiOperation({ summary: 'Подтвердить заявку на встречу' })
	@ApiOkResponse({ type: ConfirmMeetingRequestResponseDto })
	@Roles([UserRole.VOLUNTEER, UserRole.SENIOR_VOLUNTEER, UserRole.ADMIN])
	@UseGuards(AuthGuard, RoleGuard)
	@Patch(':id/confirm')
	async confirm(
		@Param('id', ParseUUIDPipe) id: string,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof ConfirmMeetingRequestResponseDto>> {
		return this.commandBus.execute(new ConfirmMeetingRequestCommand(id, user.id));
	}

	@ApiOperation({ summary: 'Отклонить заявку на встречу' })
	@ApiOkResponse({ type: RejectMeetingRequestResponseDto })
	@Roles([UserRole.VOLUNTEER, UserRole.SENIOR_VOLUNTEER, UserRole.ADMIN])
	@UseGuards(AuthGuard, RoleGuard)
	@Patch(':id/reject')
	async reject(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: RejectMeetingRequestDto,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof RejectMeetingRequestResponseDto>> {
		return this.commandBus.execute(new RejectMeetingRequestCommand(id, user.id, dto.reason));
	}
}
