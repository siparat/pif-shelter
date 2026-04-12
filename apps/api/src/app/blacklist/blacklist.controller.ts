import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	ApproveContactsRequestDto,
	ApproveContactsResponseDto,
	BanContactsRequestDto,
	BanContactsResponseDto,
	DeleteContactFromBlacklistResponseDto,
	GetBlacklistByIdResponseDto,
	ListBlacklistQueryDto,
	ListBlacklistResponseDto,
	ListBlacklistResult,
	ReturnDto,
	SuspectContactsRequestDto,
	SuspectContactsResponseDto
} from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'nestjs-zod';
import { ISession } from '../configs/auth.config';
import { Roles } from '../core/decorators/roles.decorator';
import { RoleGuard } from '../core/guards/role.guard';
import { ApproveContactsCommand } from './commands/approve-contacts/approve-contacts.command';
import { BanContactsCommand } from './commands/ban-contacts/ban-contacts.command';
import { DeleteContactFromBlacklistCommand } from './commands/delete-contact-from-blacklist/delete-contact-from-blacklist.command';
import { SuspectContactsCommand } from './commands/suspect-contacts/suspect-contacts.command';
import { GetBlacklistByIdQuery } from './queries/get-blacklist-by-id/get-blacklist-by-id.query';
import { ListBlacklistQuery } from './queries/list-blacklist/list-blacklist.query';

@ApiTags('Blacklist | Черный список')
@Controller('blacklist')
export class BlacklistController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@ApiOperation({ summary: 'Список записей черного списка' })
	@ApiOkResponse({ type: ListBlacklistResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Get()
	async list(@Query(ZodValidationPipe) query: ListBlacklistQueryDto): Promise<ListBlacklistResult> {
		return this.queryBus.execute(new ListBlacklistQuery(query));
	}

	@ApiCreatedResponse({ type: ApproveContactsResponseDto })
	@ApiOperation({ summary: 'Разблокировка одного или нескольких контактов' })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Post('approve')
	async approveContacts(
		@Body() dto: ApproveContactsRequestDto,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof ApproveContactsResponseDto>> {
		return this.commandBus.execute(new ApproveContactsCommand(dto, user.id));
	}

	@ApiCreatedResponse({ type: BanContactsResponseDto })
	@ApiOperation({ summary: 'Блокировка одного или нескольких контактов' })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Post('ban')
	async banContacts(
		@Body() dto: BanContactsRequestDto,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof BanContactsResponseDto>> {
		return this.commandBus.execute(new BanContactsCommand(dto, user.id));
	}

	@ApiCreatedResponse({ type: SuspectContactsResponseDto })
	@ApiOperation({ summary: 'Поставить контакт на подозрение (временная блокировка)' })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Post('suspect')
	async suspectContacts(
		@Body() dto: SuspectContactsRequestDto,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof SuspectContactsResponseDto>> {
		return this.commandBus.execute(new SuspectContactsCommand(dto, user.id));
	}

	@ApiOperation({ summary: 'Запись черного списка по id' })
	@ApiOkResponse({ type: GetBlacklistByIdResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Get(':id')
	async getById(@Param('id', ParseUUIDPipe) id: string): Promise<ReturnDto<typeof GetBlacklistByIdResponseDto>> {
		return this.queryBus.execute(new GetBlacklistByIdQuery(id));
	}

	@ApiOkResponse({ type: DeleteContactFromBlacklistResponseDto })
	@ApiOperation({ summary: 'Удалить контакт из черного списка' })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Delete(':id')
	async delete(
		@Param('id', ParseUUIDPipe) id: string,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof DeleteContactFromBlacklistResponseDto>> {
		return this.commandBus.execute(new DeleteContactFromBlacklistCommand(id, user.id));
	}
}
