import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	AnimalDto,
	AssignAnimalLabelRequestDto,
	AssignAnimalLabelResponseDto,
	ChangeAnimalStatusRequestDto,
	ChangeAnimalStatusResponseDto,
	CreateAnimalRequestDto,
	CreateAnimalResponseDto,
	GetAnimalByIdResponseDto,
	ListAnimalsRequestDto,
	ListAnimalsResponseDto,
	ListAnimalsResult,
	ReturnDto,
	SetCostOfGuardianshipRequestDto,
	SetCostOfGuardianshipResponseDto,
	UpdateAnimalRequestDto,
	UpdateAnimalResponseDto
} from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'nestjs-zod';
import { Roles } from '../core/decorators/roles.decorator';
import { RoleGuard } from '../core/guards/role.guard';
import { AssignAnimalLabelCommand } from './commands/assign-animal-label/assign-animal-label.command';
import { ChangeAnimalStatusCommand } from './commands/change-status/change-status.command';
import { CreateAnimalCommand } from './commands/create-animal/create-animal.command';
import { SetCostOfGuardianshipCommand } from './commands/set-cost-of-guardianship/set-cost-of-guardianship.command';
import { UnassignAnimalLabelCommand } from './commands/unassign-animal-label/unassign-animal-label.command';
import { UpdateAnimalCommand } from './commands/update-animal/update-animal.command';
import { GetAnimalByIdQuery } from './queries/get-animal-by-id/get-animal-by-id.query';
import { ListAnimalsQuery } from './queries/list-animals/list-animals.query';

@ApiTags('Animals | Питомцы')
@Controller('animals')
export class AnimalsController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@ApiOperation({
		summary: 'Создание нового питомца',
		description: 'Добавляет нового питомца в базу данных. Доступно администраторам и старшим волонтерам.'
	})
	@ApiCreatedResponse({ description: 'Питомец успешно создан', type: CreateAnimalResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Post()
	async create(@Body() dto: CreateAnimalRequestDto): Promise<ReturnDto<typeof CreateAnimalResponseDto>> {
		const id = await this.commandBus.execute(new CreateAnimalCommand(dto));
		return { id };
	}

	@ApiOperation({
		summary: 'Установить стоимость опекунства для животного',
		description:
			'Устанавливает стоимость опекунства для животного по ID. Если стоимость == null, то отменяется подписка на оплату опекунства и возвращает средства'
	})
	@ApiOkResponse({ description: 'Стоимость опекунства успешно установлена', type: SetCostOfGuardianshipResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Patch(':id/cost-of-guardianship')
	async setCostOfGuardianship(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: SetCostOfGuardianshipRequestDto
	): Promise<ReturnDto<typeof SetCostOfGuardianshipResponseDto>> {
		const { newCost, oldCost } = await this.commandBus.execute(new SetCostOfGuardianshipCommand(id, dto));
		return { animalId: id, newCost, oldCost };
	}

	@ApiOperation({ summary: 'Список питомцев', description: 'Возвращает список питомцев с пагинацией и фильтрацией.' })
	@ApiOkResponse({ description: 'Список получен', type: ListAnimalsResponseDto })
	@Get()
	async list(@Query(ZodValidationPipe) query: ListAnimalsRequestDto): Promise<ListAnimalsResult> {
		return this.queryBus.execute(new ListAnimalsQuery(query));
	}

	@ApiOperation({ summary: 'Получить питомца по ID', description: 'Возвращает полную информацию о питомце.' })
	@ApiOkResponse({ description: 'Питомец найден', type: GetAnimalByIdResponseDto })
	@Get(':id')
	async getById(@Param('id', ParseUUIDPipe) id: string): Promise<AnimalDto> {
		return this.queryBus.execute(new GetAnimalByIdQuery(id));
	}

	@ApiOperation({ summary: 'Обновление данных питомца', description: 'Обновляет данные питомца по ID.' })
	@ApiOkResponse({ description: 'Питомец успешно обновлен', type: UpdateAnimalResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Patch(':id')
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateAnimalRequestDto
	): Promise<ReturnDto<typeof UpdateAnimalResponseDto>> {
		const updatedId = await this.commandBus.execute(new UpdateAnimalCommand(id, dto));
		return { id: updatedId };
	}

	@ApiOperation({ summary: 'Обновить статус животного', description: 'Обновляет статус питомца по ID.' })
	@ApiOkResponse({ description: 'Статус питомца успешно обновлен', type: ChangeAnimalStatusResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Patch(':id/status')
	async changeStatus(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() { status }: ChangeAnimalStatusRequestDto
	): Promise<ReturnDto<typeof ChangeAnimalStatusResponseDto>> {
		return this.commandBus.execute(new ChangeAnimalStatusCommand(id, status));
	}

	@ApiOperation({ summary: 'Привязать ярлык к животному', description: 'Добавляет связь между животным и ярлыком.' })
	@ApiCreatedResponse({ description: 'Ярлык успешно привязан', type: AssignAnimalLabelResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Post(':id/label')
	async assignLabel(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() { labelId }: AssignAnimalLabelRequestDto
	): Promise<ReturnDto<typeof AssignAnimalLabelResponseDto>> {
		await this.commandBus.execute(new AssignAnimalLabelCommand(id, labelId));
		return { animalId: id, labelId };
	}

	@ApiOperation({ summary: 'Отвязать ярлык от животного', description: 'Удаляет связь между животным и ярлыком.' })
	@ApiOkResponse({ description: 'Ярлык успешно отвязан' })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Delete(':id/label/:labelId')
	async unassignLabel(
		@Param('id', ParseUUIDPipe) id: string,
		@Param('labelId', ParseUUIDPipe) labelId: string
	): Promise<void> {
		await this.commandBus.execute(new UnassignAnimalLabelCommand(id, labelId));
	}
}
