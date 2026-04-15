import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Headers,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseGuards
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ListPostsResult } from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { AuthGuard, AuthService, Session } from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'nestjs-zod';
import {
	CreatePostRequestDto,
	CreatePostResponseDto,
	GetPostResponseDto,
	ListPostsRequestDto,
	ListPostsResponseDto,
	ReturnData,
	SetPostReactionRequestDto,
	UpdatePostRequestDto,
	UpdatePostResponseDto
} from '../core/dto';
import { ISession } from '../configs/auth.config';
import { Roles } from '../core/decorators/roles.decorator';
import { RoleGuard } from '../core/guards/role.guard';
import { CreatePostCommand } from './commands/create-post/create-post.command';
import { DeletePostCommand } from './commands/delete-post/delete-post.command';
import { SetPostReactionCommand } from './commands/set-post-reaction/set-post-reaction.command';
import { UpdatePostCommand } from './commands/update-post/update-post.command';
import { GetPostQuery } from './queries/get-post/get-post.query';
import { ListPostsQuery } from './queries/list-posts/list-posts.query';

@ApiTags('Posts | Посты')
@Controller('posts')
export class PostsController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly authService: AuthService
	) {}

	@ApiHeader({
		name: 'X-Anonymous-Visitor-Id',
		required: false,
		description: 'Идентификатор анонимного пользователя'
	})
	@ApiOperation({
		summary: 'Список постов',
		description:
			'Возвращает список постов с пагинацией и поиском. Без авторизации — только публичные. С авторизацией — с учётом прав (приватные для опекунов и сотрудников).'
	})
	@ApiOkResponse({ description: 'Список получен', type: ListPostsResponseDto })
	@Get()
	async list(
		@Query(ZodValidationPipe) query: ListPostsRequestDto,
		@Headers() headers: HeadersInit,
		@Headers('X-Anonymous-Visitor-Id') visitorId?: string
	): Promise<ListPostsResult> {
		const session = (await this.authService.api.getSession({ headers })) as ISession | undefined;
		const userId = session?.user?.id ?? null;
		const userRole = session?.user?.role ?? null;
		return this.queryBus.execute(new ListPostsQuery(query, userId, userRole, userId || visitorId));
	}

	@ApiHeader({
		name: 'X-Anonymous-Visitor-Id',
		required: false,
		description: 'Идентификатор анонимного пользователя'
	})
	@ApiOperation({
		summary: 'Получить пост по ID',
		description: 'Возвращает пост. Приватные посты доступны опекунам и сотрудникам.'
	})
	@ApiOkResponse({ description: 'Пост найден', type: GetPostResponseDto })
	@Get(':id')
	async getById(
		@Param('id', ParseUUIDPipe) id: string,
		@Headers() headers: HeadersInit,
		@Headers('X-Anonymous-Visitor-Id') visitorId?: string
	): Promise<ReturnData<typeof GetPostResponseDto>> {
		const session = (await this.authService.api.getSession({ headers })) as ISession | undefined;
		const userId = session?.user?.id ?? null;
		const userRole = session?.user?.role ?? null;
		return this.queryBus.execute(new GetPostQuery(id, userId, userRole, userId || visitorId));
	}

	@ApiHeader({
		name: 'X-Anonymous-Visitor-Id',
		required: false,
		description: 'Идентификатор анонимного пользователя'
	})
	@ApiOperation({
		summary: 'Поставить или снять реакцию на пост',
		description:
			'Устанавливает реакцию от анонимного посетителя. Повторный запрос с тем же emoji снимает реакцию (toggle). Один посетитель — одна реакция на пост. Без авторизации.'
	})
	@ApiOkResponse({ description: 'Реакция обновлена' })
	@Throttle({ short: { ttl: 1000, limit: 3 } })
	@Patch(':id/reaction')
	async setReaction(
		@Param('id', ParseUUIDPipe) id: string,
		@Body(ZodValidationPipe) dto: SetPostReactionRequestDto,
		@Headers() headers: HeadersInit,
		@Headers('X-Anonymous-Visitor-Id')
		visitorId?: string
	): Promise<void> {
		const session = (await this.authService.api.getSession({ headers })) as ISession | undefined;
		const userId = session?.user?.id ?? visitorId;
		if (!userId) {
			throw new BadRequestException('X-Anonymous-Visitor-Id не передан');
		}
		await this.commandBus.execute(new SetPostReactionCommand(id, dto.emoji, userId));
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
