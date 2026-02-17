import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAnimalRequestDto, CreateAnimalResponseDto, ReturnDto } from '@pif/contracts';
import { CreateAnimalCommand } from './commands/create-animal/create-animal.command';

@ApiTags('Animals | Питомцы')
@Controller('animals')
export class AnimalsController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly mailerService: MailerService
	) {}

	@ApiOperation({
		summary: 'Создание нового питомца',
		description: 'Добавляет нового питомца в базу данных. Доступно администраторам и старшим волонтерам.'
	})
	@ApiCreatedResponse({
		description: 'Питомец успешно создан',
		type: CreateAnimalResponseDto
	})
	@Post()
	async create(@Body() dto: CreateAnimalRequestDto): Promise<ReturnDto<typeof CreateAnimalResponseDto>> {
		const id = await this.commandBus.execute(new CreateAnimalCommand(dto));
		return { id };
	}
}
