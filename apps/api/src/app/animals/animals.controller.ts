import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	AnimalDto,
	ChangeAnimalStatusRequestDto,
	ChangeAnimalStatusResponseDto,
	CreateAnimalRequestDto,
	CreateAnimalResponseDto,
	GetAnimalByIdResponseDto,
	ListAnimalsRequestDto,
	ListAnimalsResponseDto,
	ListAnimalsResult,
	ReturnDto,
	UpdateAnimalRequestDto,
	UpdateAnimalResponseDto
} from '@pif/contracts';
import { ZodValidationPipe } from 'nestjs-zod';
import { ChangeAnimalStatusCommand } from './commands/change-status/change-status.command';
import { CreateAnimalCommand } from './commands/create-animal/create-animal.command';
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
	@Post()
	async create(@Body() dto: CreateAnimalRequestDto): Promise<ReturnDto<typeof CreateAnimalResponseDto>> {
		const id = await this.commandBus.execute(new CreateAnimalCommand(dto));
		return { id };
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
	@Patch(':id/status')
	async changeStatus(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() { status }: ChangeAnimalStatusRequestDto
	): Promise<ReturnDto<typeof ChangeAnimalStatusResponseDto>> {
		return this.commandBus.execute(new ChangeAnimalStatusCommand(id, status));
	}
}
