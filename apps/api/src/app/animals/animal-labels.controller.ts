import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnimalLabel } from '@pif/database';
import { UserRole } from '@pif/shared';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import {
	CreateAnimalLabelRequestDto,
	CreateAnimalLabelResponseDto,
	ListAnimalLabelsResponseDto,
	ReturnData,
	UpdateAnimalLabelRequestDto,
	UpdateAnimalLabelResponseDto
} from '../core/dto';
import { Roles } from '../core/decorators/roles.decorator';
import { RoleGuard } from '../core/guards/role.guard';
import { CreateAnimalLabelCommand } from './commands/create-animal-label/create-animal-label.command';
import { DeleteAnimalLabelCommand } from './commands/delete-animal-label/delete-animal-label.command';
import { UpdateAnimalLabelCommand } from './commands/update-animal-label/update-animal-label.command';
import { ListAnimalLabelsQuery } from './queries/list-animal-labels/list-animal-labels.query';

@ApiTags('Animal labels | Управление ярлыками')
@Controller('animals/labels')
export class AnimalLabelsController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@ApiOperation({ summary: 'Создать новый ярлык' })
	@ApiCreatedResponse({ description: 'Ярлык успешно создан', type: CreateAnimalLabelResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Post()
	async create(@Body() dto: CreateAnimalLabelRequestDto): Promise<ReturnData<typeof CreateAnimalLabelResponseDto>> {
		const { labelId } = await this.commandBus.execute(new CreateAnimalLabelCommand(dto));
		return { id: labelId };
	}

	@ApiOperation({ summary: 'Список всех ярлыков' })
	@ApiOkResponse({ description: 'Список получен', type: ListAnimalLabelsResponseDto })
	@Get()
	async list(): Promise<AnimalLabel[]> {
		return this.queryBus.execute(new ListAnimalLabelsQuery());
	}

	@ApiOperation({ summary: 'Обновить данные ярлыка' })
	@ApiOkResponse({ description: 'Ярлык успешно обновлен', type: UpdateAnimalLabelResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Patch(':id')
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateAnimalLabelRequestDto
	): Promise<ReturnData<typeof UpdateAnimalLabelResponseDto>> {
		return this.commandBus.execute(new UpdateAnimalLabelCommand(id, dto));
	}

	@ApiOperation({ summary: 'Удалить ярлык' })
	@ApiOkResponse({ description: 'Ярлык успешно удален' })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Delete(':id')
	async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.commandBus.execute(new DeleteAnimalLabelCommand(id));
	}
}
