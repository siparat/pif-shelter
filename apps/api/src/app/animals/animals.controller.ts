import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListAnimalsResult } from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'nestjs-zod';
import { ISession } from '../configs/auth.config';
import { Roles } from '../core/decorators/roles.decorator';
import {
	AnimalDto,
	AssignAnimalLabelRequestDto,
	AssignAnimalLabelResponseDto,
	ChangeAnimalStatusRequestDto,
	ChangeAnimalStatusResponseDto,
	CreateAnimalRequestDto,
	CreateAnimalResponseDto,
	DeleteAnimalResponseDto,
	GetAnimalByIdResponseDto,
	ListAnimalsRequestDto,
	ListAnimalsResponseDto,
	ReturnData,
	SetAnimalCuratorRequestDto,
	SetAnimalCuratorResponseDto,
	SetCostOfGuardianshipRequestDto,
	SetCostOfGuardianshipResponseDto,
	UpdateAnimalRequestDto,
	UpdateAnimalResponseDto
} from '../core/dto';
import { RoleGuard } from '../core/guards/role.guard';
import { AssignAnimalLabelCommand } from './commands/assign-animal-label/assign-animal-label.command';
import { ChangeAnimalStatusCommand } from './commands/change-status/change-status.command';
import { CreateAnimalCommand } from './commands/create-animal/create-animal.command';
import { DeleteAnimalCommand } from './commands/delete-animal/delete-animal.command';
import { SetAnimalCuratorCommand } from './commands/set-animal-curator/set-animal-curator.command';
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
	async create(@Body() dto: CreateAnimalRequestDto): Promise<ReturnData<typeof CreateAnimalResponseDto>> {
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
	): Promise<ReturnData<typeof SetCostOfGuardianshipResponseDto>> {
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

	@ApiOperation({ summary: 'Удалить животное', description: 'Удаляет карточку животного по ID.' })
	@ApiOkResponse({ description: 'Животное удалено', type: DeleteAnimalResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Delete(':id')
	async delete(@Param('id', ParseUUIDPipe) id: string): Promise<ReturnData<typeof DeleteAnimalResponseDto>> {
		await this.commandBus.execute(new DeleteAnimalCommand(id));
		return { id };
	}

	@ApiOperation({ summary: 'Обновление данных питомца', description: 'Обновляет данные питомца по ID.' })
	@ApiOkResponse({ description: 'Питомец успешно обновлен', type: UpdateAnimalResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER, UserRole.VOLUNTEER])
	@Patch(':id')
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateAnimalRequestDto,
		@Session() session: ISession
	): Promise<ReturnData<typeof UpdateAnimalResponseDto>> {
		const updatedId = await this.commandBus.execute(
			new UpdateAnimalCommand(id, dto, session.user.id, session.user.role)
		);
		return { id: updatedId };
	}

	@ApiOperation({ summary: 'Обновить статус животного', description: 'Обновляет статус питомца по ID.' })
	@ApiOkResponse({ description: 'Статус питомца успешно обновлен', type: ChangeAnimalStatusResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER, UserRole.VOLUNTEER])
	@Patch(':id/status')
	async changeStatus(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() { status }: ChangeAnimalStatusRequestDto,
		@Session() session: ISession
	): Promise<ReturnData<typeof ChangeAnimalStatusResponseDto>> {
		return this.commandBus.execute(new ChangeAnimalStatusCommand(id, status, session.user.id, session.user.role));
	}

	@ApiOperation({ summary: 'Привязать ярлык к животному', description: 'Добавляет связь между животным и ярлыком.' })
	@ApiCreatedResponse({ description: 'Ярлык успешно привязан', type: AssignAnimalLabelResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER, UserRole.VOLUNTEER])
	@Post(':id/label')
	async assignLabel(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() { labelId }: AssignAnimalLabelRequestDto,
		@Session() session: ISession
	): Promise<ReturnData<typeof AssignAnimalLabelResponseDto>> {
		await this.commandBus.execute(new AssignAnimalLabelCommand(id, labelId, session.user.id, session.user.role));
		return { animalId: id, labelId };
	}

	@ApiOperation({ summary: 'Отвязать ярлык от животного', description: 'Удаляет связь между животным и ярлыком.' })
	@ApiOkResponse({ description: 'Ярлык успешно отвязан' })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER, UserRole.VOLUNTEER])
	@Delete(':id/label/:labelId')
	async unassignLabel(
		@Param('id', ParseUUIDPipe) id: string,
		@Param('labelId', ParseUUIDPipe) labelId: string,
		@Session() session: ISession
	): Promise<void> {
		await this.commandBus.execute(new UnassignAnimalLabelCommand(id, labelId, session.user.id, session.user.role));
	}

	@ApiOperation({
		summary: 'Назначить или снять куратора животного',
		description:
			'Устанавливает куратора (волонтёра) для животного или снимает куратора (curatorId: null). Доступно только администраторам и старшим волонтёрам.'
	})
	@ApiOkResponse({ description: 'Куратор обновлён', type: SetAnimalCuratorResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@Patch(':id/curator')
	async setCurator(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: SetAnimalCuratorRequestDto
	): Promise<ReturnData<typeof SetAnimalCuratorResponseDto>> {
		const { curatorId } = await this.commandBus.execute(new SetAnimalCuratorCommand(id, dto.curatorId));
		return { animalId: id, curatorId };
	}
}
