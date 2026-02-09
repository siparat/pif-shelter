import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateAnimalDto } from '@pif/contracts';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateAnimalCommand } from './commands/create-animal/create-animal.command';

@Controller('animals')
export class AnimalsController {
	constructor(private readonly commandBus: CommandBus) {}

	// @Roles('ADMIN', 'SENIOR_VOLUNTEER') // TODO: Implement Auth Guard
	// @Throttle(...) // TODO: Implement Rate Limiting
	@UsePipes(ZodValidationPipe)
	@Post()
	async create(@Body() dto: CreateAnimalDto): Promise<{ id: string }> {
		const id = await this.commandBus.execute(new CreateAnimalCommand(dto));
		return { id };
	}
}
