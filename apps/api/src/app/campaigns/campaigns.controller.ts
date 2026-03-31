import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	CreateCampaignRequestDto,
	CreateCampaignResponseDto,
	GetCampaignByIdResponseDto,
	ReturnDto
} from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { ISession } from '../configs/auth.config';
import { Roles } from '../core/decorators/roles.decorator';
import { RoleGuard } from '../core/guards/role.guard';
import { CreateCampaignCommand } from './commands/create-campaign/create-campaign.command';
import { CampaignDetails, GetCampaignByIdQuery } from './queries/get-campaign-by-id/get-campaign-by-id.query';

@ApiTags('Campaigns | Срочные сборы')
@Controller('campaigns')
export class CampaignsController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

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
}
