import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePostRequestDto, CreatePostResponseDto } from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'nestjs-zod';
import { ISession } from '../configs/auth.config';
import { Roles } from '../core/decorators/roles.decorator';
import { RoleGuard } from '../core/guards/role.guard';
import { CreatePostCommand } from './commands/create-post/create-post.command';

@ApiTags('Posts | Посты')
@Controller('posts')
export class PostsController {
	constructor(private readonly commandBus: CommandBus) {}

	@ApiOperation({
		summary: 'Создать пост',
		description: 'Создаёт пост по животному. Доступно куратору животного, старшему волонтёру и администратору.'
	})
	@ApiCreatedResponse({ description: 'Пост создан', type: CreatePostResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER, UserRole.VOLUNTEER])
	@Post()
	async create(
		@Body(ZodValidationPipe) dto: CreatePostRequestDto,
		@Session() session: ISession
	): Promise<{ id: string }> {
		const id = await this.commandBus.execute(new CreatePostCommand(dto, session.user.id, session.user.role));
		return { id };
	}
}
