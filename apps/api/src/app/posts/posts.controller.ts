import { Body, Controller, Delete, Get, Headers, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	CreatePostRequestDto,
	CreatePostResponseDto,
	UpdatePostRequestDto,
	UpdatePostResponseDto
} from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AuthGuard, AuthService, Session } from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'nestjs-zod';
import { ISession } from '../configs/auth.config';
import { Roles } from '../core/decorators/roles.decorator';
import { RoleGuard } from '../core/guards/role.guard';
import { CreatePostCommand } from './commands/create-post/create-post.command';
import { DeletePostCommand } from './commands/delete-post/delete-post.command';
import { UpdatePostCommand } from './commands/update-post/update-post.command';
import { PostResponseDto } from './mappers/post.mapper';
import { GetPostQuery } from './queries/get-post/get-post.query';

@ApiTags('Posts | Посты')
@Controller('posts')
export class PostsController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly authService: AuthService
	) {}

	@ApiOperation({
		summary: 'Получить пост по ID',
		description: 'Возвращает пост. Приватные посты доступны опекунам и сотрудникам.'
	})
	@ApiOkResponse({ description: 'Пост найден' })
	@Get(':id')
	async getById(@Param('id', ParseUUIDPipe) id: string, @Headers() headers: HeadersInit): Promise<PostResponseDto> {
		const session = (await this.authService.api.getSession({ headers })) as ISession | undefined;
		const userId = session?.user?.id ?? null;
		const userRole = session?.user?.role ?? null;
		return this.queryBus.execute(new GetPostQuery(id, userId, userRole));
	}

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

	@ApiOperation({
		summary: 'Обновить пост',
		description: 'Обновляет пост. Доступно автору, старшему волонтёру и администратору.'
	})
	@ApiOkResponse({ description: 'Пост обновлён', type: UpdatePostResponseDto })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER, UserRole.VOLUNTEER])
	@Patch(':id')
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body(ZodValidationPipe) dto: UpdatePostRequestDto,
		@Session() session: ISession
	): Promise<{ id: string }> {
		await this.commandBus.execute(new UpdatePostCommand(id, dto, session.user.id, session.user.role));
		return { id };
	}

	@ApiOperation({
		summary: 'Удалить пост',
		description: 'Удаляет пост. Идемпотентно. Доступно автору, старшему волонтёру и администратору.'
	})
	@ApiOkResponse({ description: 'Пост удалён' })
	@UseGuards(AuthGuard, RoleGuard)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER, UserRole.VOLUNTEER])
	@Delete(':id')
	async delete(@Param('id', ParseUUIDPipe) id: string, @Session() session: ISession): Promise<void> {
		await this.commandBus.execute(new DeletePostCommand(id, session.user.id, session.user.role));
	}
}
