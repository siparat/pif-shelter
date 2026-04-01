import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	CreateCampaignRequestDto,
	CreateCampaignResponseDto,
	GetCampaignByIdResponseDto,
	ReturnDto,
	SearchCampaignsRequestDto,
	SearchCampaignsResponseDto,
	UpdateCampaignRequestDto,
	UpdateCampaignResponseDto
} from '@pif/contracts';
import { CampaignStatus, UserRole } from '@pif/shared';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { ISession } from '../configs/auth.config';
import { Roles } from '../core/decorators/roles.decorator';
import { RoleGuard } from '../core/guards/role.guard';
import { ChangeCampaignStatusCommand } from './commands/change-campaign-status/change-campaign-status.command';
import { CreateCampaignCommand } from './commands/create-campaign/create-campaign.command';
import { DeleteCampaignCommand } from './commands/delete-campaign/delete-campaign.command';
import { UpdateCampaignCommand } from './commands/update-campaign/update-campaign.command';
import { CampaignDetails, GetCampaignByIdQuery } from './queries/get-campaign-by-id/get-campaign-by-id.query';
import { CampaingsSearchResult, SearchCampaignsQuery } from './queries/search-campaigns/search-campaigns.query';

@ApiTags('Campaigns | Срочные сборы')
@Controller('campaigns')
export class CampaignsController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@ApiOperation({
		summary: 'Поиск сборов',
		description: 'Получение списка сборов по фильтру'
	})
	@ApiOkResponse({ type: SearchCampaignsResponseDto })
	@Get()
	async search(@Query() dto: SearchCampaignsRequestDto): Promise<CampaingsSearchResult> {
		return this.queryBus.execute(new SearchCampaignsQuery(dto));
	}

	@ApiOperation({
		summary: 'Создание срочного сбора',
		description: 'Создает срочный сбор. Доступно старшему волонтёру и администратору'
	})
	@ApiOkResponse({ type: CreateCampaignResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Post()
	async create(
		@Body() dto: CreateCampaignRequestDto,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof CreateCampaignResponseDto>> {
		return this.commandBus.execute(new CreateCampaignCommand(dto, user.id));
	}

	@ApiOperation({
		summary: 'Срочный сбор по id',
		description: 'Получение сбора по id. Если не найдено вернет 404'
	})
	@ApiOkResponse({ type: GetCampaignByIdResponseDto })
	@Get(':id')
	async getById(@Param('id', ParseUUIDPipe) id: string): Promise<CampaignDetails> {
		return this.queryBus.execute(new GetCampaignByIdQuery(id));
	}

	@ApiOperation({
		summary: 'Обновление срочного сбора',
		description: 'Обновляет срочный сбор. Доступно старшему волонтёру и администратору'
	})
	@ApiOkResponse({ type: UpdateCampaignResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Patch(':id')
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateCampaignRequestDto,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof UpdateCampaignResponseDto>> {
		return this.commandBus.execute(new UpdateCampaignCommand(id, dto, user.id));
	}

	@ApiOperation({
		summary: 'Черновик срочного сбора',
		description: 'Переводит статус сбора в DRAFT'
	})
	@ApiOkResponse({ type: UpdateCampaignResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Patch(':id/draft')
	async draft(
		@Param('id', ParseUUIDPipe) id: string,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof UpdateCampaignResponseDto>> {
		return this.commandBus.execute(new ChangeCampaignStatusCommand(id, CampaignStatus.DRAFT, user.id));
	}

	@ApiOperation({
		summary: 'Публикация срочного сбора',
		description: 'Переводит статус сбора в PUBLISHED'
	})
	@ApiOkResponse({ type: UpdateCampaignResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Patch(':id/publish')
	async publish(
		@Param('id', ParseUUIDPipe) id: string,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof UpdateCampaignResponseDto>> {
		return this.commandBus.execute(new ChangeCampaignStatusCommand(id, CampaignStatus.PUBLISHED, user.id));
	}

	@ApiOperation({
		summary: 'Отмена срочного сбора',
		description: 'Переводит статус сбора в CANCELLED'
	})
	@ApiOkResponse({ type: UpdateCampaignResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Patch(':id/cancel')
	async cancel(
		@Param('id', ParseUUIDPipe) id: string,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof UpdateCampaignResponseDto>> {
		return this.commandBus.execute(new ChangeCampaignStatusCommand(id, CampaignStatus.CANCELLED, user.id));
	}

	@ApiOperation({
		summary: 'Закрытие сбора как успешного',
		description: 'Переводит статус сбора в SUCCESS'
	})
	@ApiOkResponse({ type: UpdateCampaignResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Patch(':id/success')
	async markSuccess(
		@Param('id', ParseUUIDPipe) id: string,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof UpdateCampaignResponseDto>> {
		return this.commandBus.execute(new ChangeCampaignStatusCommand(id, CampaignStatus.SUCCESS, user.id));
	}

	@ApiOperation({
		summary: 'Закрытие сбора как неуспешного',
		description: 'Переводит статус сбора в FAILED'
	})
	@ApiOkResponse({ type: UpdateCampaignResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Patch(':id/fail')
	async markFailed(
		@Param('id', ParseUUIDPipe) id: string,
		@Session() { user }: ISession
	): Promise<ReturnDto<typeof UpdateCampaignResponseDto>> {
		return this.commandBus.execute(new ChangeCampaignStatusCommand(id, CampaignStatus.FAILED, user.id));
	}

	@ApiOperation({
		summary: 'Удаление срочного сбора',
		description: 'Удаляет срочный сбор. Идемпотентно. Доступно старшему волонтёру и администратору'
	})
	@ApiOkResponse({ description: 'Срочный сбор удалён' })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Delete(':id')
	async delete(@Param('id', ParseUUIDPipe) id: string, @Session() { user }: ISession): Promise<void> {
		await this.commandBus.execute(new DeleteCampaignCommand(id, user.id));
	}
}
