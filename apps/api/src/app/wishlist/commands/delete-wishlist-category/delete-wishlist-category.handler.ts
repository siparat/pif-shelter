import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { WishlistCategoryNotFoundException } from '../../exceptions/wishlist-category-not-found.exception';
import { WishlistDataChangedEvent } from '../../events/wishlist-data-changed/wishlist-data-changed.event';
import { WishlistRepository } from '../../repositories/wishlist.repository';
import { DeleteWishlistCategoryCommand } from './delete-wishlist-category.command';

@CommandHandler(DeleteWishlistCategoryCommand)
export class DeleteWishlistCategoryHandler implements ICommandHandler<DeleteWishlistCategoryCommand> {
	constructor(
		private readonly repository: WishlistRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ id }: DeleteWishlistCategoryCommand): Promise<void> {
		const isDeleted = await this.repository.deleteCategory(id);
		if (!isDeleted) {
			throw new WishlistCategoryNotFoundException();
		}
		await this.eventBus.publish(new WishlistDataChangedEvent());
		this.logger.log('Категория wishlist удалена', { categoryId: id });
	}
}
