import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { WishlistItemNotFoundException } from '../../exceptions/wishlist-item-not-found.exception';
import { WishlistDataChangedEvent } from '../../events/wishlist-data-changed/wishlist-data-changed.event';
import { WishlistRepository } from '../../repositories/wishlist.repository';
import { DeleteWishlistItemCommand } from './delete-wishlist-item.command';

@CommandHandler(DeleteWishlistItemCommand)
export class DeleteWishlistItemHandler implements ICommandHandler<DeleteWishlistItemCommand> {
	constructor(
		private readonly repository: WishlistRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ id }: DeleteWishlistItemCommand): Promise<void> {
		const isDeleted = await this.repository.deleteItem(id);
		if (!isDeleted) {
			throw new WishlistItemNotFoundException();
		}
		await this.eventBus.publish(new WishlistDataChangedEvent());
		this.logger.log('Позиция wishlist удалена', { itemId: id });
	}
}
