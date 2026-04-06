import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateWishlistCategoryHandler } from './commands/create-wishlist-category/create-wishlist-category.handler';
import { CreateWishlistItemHandler } from './commands/create-wishlist-item/create-wishlist-item.handler';
import { DeleteWishlistCategoryHandler } from './commands/delete-wishlist-category/delete-wishlist-category.handler';
import { DeleteWishlistItemHandler } from './commands/delete-wishlist-item/delete-wishlist-item.handler';
import { UpdateWishlistCategoryHandler } from './commands/update-wishlist-category/update-wishlist-category.handler';
import { UpdateWishlistItemHandler } from './commands/update-wishlist-item/update-wishlist-item.handler';
import { WishlistCacheInvalidatedHandler } from './events/wishlist-data-changed/wishlist-cache-invalidated.handler';
import { GetPublicWishlistHandler } from './queries/get-public-wishlist/get-public-wishlist.handler';
import { GetWishlistManageHandler } from './queries/get-wishlist-manage/get-wishlist-manage.handler';
import { DrizzleWishlistRepository } from './repositories/drizzle-wishlist.repository';
import { WishlistRepository } from './repositories/wishlist.repository';
import { WishlistController } from './wishlist.controller';

@Module({
	imports: [CqrsModule],
	controllers: [WishlistController],
	providers: [
		CreateWishlistCategoryHandler,
		UpdateWishlistCategoryHandler,
		DeleteWishlistCategoryHandler,
		CreateWishlistItemHandler,
		UpdateWishlistItemHandler,
		DeleteWishlistItemHandler,
		GetPublicWishlistHandler,
		GetWishlistManageHandler,
		WishlistCacheInvalidatedHandler,
		{
			provide: WishlistRepository,
			useClass: DrizzleWishlistRepository
		}
	]
})
export class WishlistModule {}
