import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	UseGuards
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@pif/shared';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import {
	CreateWishlistCategoryRequestDto,
	CreateWishlistCategoryResponseDto,
	CreateWishlistItemRequestDto,
	CreateWishlistItemResponseDto,
	GetPublicWishlistData,
	GetPublicWishlistResponseDto,
	GetWishlistManageData,
	GetWishlistManageResponseDto,
	ReturnData,
	UpdateWishlistCategoryRequestDto,
	UpdateWishlistCategoryResponseDto,
	UpdateWishlistItemRequestDto,
	UpdateWishlistItemResponseDto
} from '../core/dto';
import { Roles } from '../core/decorators/roles.decorator';
import { RoleGuard } from '../core/guards/role.guard';
import { CreateWishlistCategoryCommand } from './commands/create-wishlist-category/create-wishlist-category.command';
import { CreateWishlistItemCommand } from './commands/create-wishlist-item/create-wishlist-item.command';
import { DeleteWishlistCategoryCommand } from './commands/delete-wishlist-category/delete-wishlist-category.command';
import { DeleteWishlistItemCommand } from './commands/delete-wishlist-item/delete-wishlist-item.command';
import { UpdateWishlistCategoryCommand } from './commands/update-wishlist-category/update-wishlist-category.command';
import { UpdateWishlistItemCommand } from './commands/update-wishlist-item/update-wishlist-item.command';
import { GetPublicWishlistQuery } from './queries/get-public-wishlist/get-public-wishlist.query';
import { GetWishlistManageQuery } from './queries/get-wishlist-manage/get-wishlist-manage.query';

@ApiTags('Wishlist | Список нужд')
@Controller('wishlist')
export class WishlistController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@ApiOperation({ summary: 'Публичный список нужд' })
	@ApiOkResponse({ type: GetPublicWishlistResponseDto })
	@Get()
	async getPublic(): Promise<GetPublicWishlistData> {
		return this.queryBus.execute(new GetPublicWishlistQuery());
	}

	@ApiOperation({ summary: 'Полное дерево категорий и позиций для админки' })
	@ApiOkResponse({ type: GetWishlistManageResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Get('manage')
	async getManage(): Promise<GetWishlistManageData> {
		return this.queryBus.execute(new GetWishlistManageQuery());
	}

	@ApiOperation({ summary: 'Создать категорию' })
	@ApiCreatedResponse({ type: CreateWishlistCategoryResponseDto })
	@HttpCode(HttpStatus.CREATED)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Post('categories')
	async createCategory(
		@Body() dto: CreateWishlistCategoryRequestDto
	): Promise<ReturnData<typeof CreateWishlistCategoryResponseDto>> {
		return this.commandBus.execute(new CreateWishlistCategoryCommand(dto));
	}

	@ApiOperation({ summary: 'Обновить категорию' })
	@ApiOkResponse({ type: UpdateWishlistCategoryResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Patch('categories/:id')
	async updateCategory(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateWishlistCategoryRequestDto
	): Promise<ReturnData<typeof UpdateWishlistCategoryResponseDto>> {
		return this.commandBus.execute(new UpdateWishlistCategoryCommand(id, dto));
	}

	@ApiOperation({ summary: 'Удалить категорию' })
	@ApiOkResponse({ description: 'Категория удалена' })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Delete('categories/:id')
	async deleteCategory(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.commandBus.execute(new DeleteWishlistCategoryCommand(id));
	}

	@ApiOperation({ summary: 'Создать позицию' })
	@ApiCreatedResponse({ type: CreateWishlistItemResponseDto })
	@HttpCode(HttpStatus.CREATED)
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Post('items')
	async createItem(
		@Body() dto: CreateWishlistItemRequestDto
	): Promise<ReturnData<typeof CreateWishlistItemResponseDto>> {
		return this.commandBus.execute(new CreateWishlistItemCommand(dto));
	}

	@ApiOperation({ summary: 'Обновить позицию' })
	@ApiOkResponse({ type: UpdateWishlistItemResponseDto })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Patch('items/:id')
	async updateItem(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateWishlistItemRequestDto
	): Promise<ReturnData<typeof UpdateWishlistItemResponseDto>> {
		return this.commandBus.execute(new UpdateWishlistItemCommand(id, dto));
	}

	@ApiOperation({ summary: 'Удалить позицию' })
	@ApiOkResponse({ description: 'Позиция удалена' })
	@Roles([UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
	@UseGuards(AuthGuard, RoleGuard)
	@Delete('items/:id')
	async deleteItem(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.commandBus.execute(new DeleteWishlistItemCommand(id));
	}
}
