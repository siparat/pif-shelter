import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAnimalRequestDto, CreateAnimalResponseDto } from '@pif/contracts';
import { InviteEmail } from '@pif/email-templates';
import { render } from '@react-email/render';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { CreateAnimalCommand } from './commands/create-animal/create-animal.command';

export class Dto extends createZodDto(
	z.object({
		email: z.email(),
		name: z.string(),
		link: z.url(),
		role: z.string(),
		subject: z.string()
	})
) {}

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
	@UsePipes(ZodValidationPipe)
	@Post()
	async create(@Body() dto: CreateAnimalRequestDto): Promise<CreateAnimalResponseDto['data']> {
		const id = await this.commandBus.execute(new CreateAnimalCommand(dto));
		return { id };
	}

	@Post('send-email')
	async sendMail(@Body() body: Dto): Promise<true> {
		return this.mailerService.sendMail({
			to: body.email,
			subject: body.subject,
			html: await render(
				InviteEmail({
					name: body.name,
					inviteLink: body.link,
					roleName: body.role
				})
			)
		});
	}
}
