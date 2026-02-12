import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAnimalRequestDto, CreateAnimalResponseDto } from '@pif/contracts';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateAnimalCommand } from './commands/create-animal/create-animal.command';

@ApiTags('Animals | Питомцы')
@Controller('animals')
export class AnimalsController {
	constructor(private readonly commandBus: CommandBus) {}

	@Post()
	@ApiOperation({
		summary: 'Создание нового питомца',
		description: 'Добавляет нового питомца в базу данных. Доступно администраторам и старшим волонтерам.'
	})
	@ApiCreatedResponse({
		description: 'Питомец успешно создан',
		type: CreateAnimalResponseDto
	})
	@UsePipes(ZodValidationPipe)
	async create(@Body() dto: CreateAnimalRequestDto): Promise<CreateAnimalResponseDto['data']> {
		const id = await this.commandBus.execute(new CreateAnimalCommand(dto));
		return { id };
	}
}
