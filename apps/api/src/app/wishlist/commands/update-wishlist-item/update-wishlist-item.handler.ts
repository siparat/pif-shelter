import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ReturnDto, UpdateWishlistItemResponseDto } from '@pif/contracts';
import { Logger } from 'nestjs-pino';
import { WishlistDataChangedEvent } from '../../events/wishlist-data-changed/wishlist-data-changed.event';
import { WishlistCategoryNotFoundException } from '../../exceptions/wishlist-category-not-found.exception';
import { WishlistItemNotFoundException } from '../../exceptions/wishlist-item-not-found.exception';
import { WishlistRepository } from '../../repositories/wishlist.repository';
import { UpdateWishlistItemCommand } from './update-wishlist-item.command';

@CommandHandler(UpdateWishlistItemCommand)
export class UpdateWishlistItemHandler implements ICommandHandler<UpdateWishlistItemCommand> {
	constructor(
		private readonly repository: WishlistRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ id, dto }: UpdateWishlistItemCommand): Promise<ReturnDto<typeof UpdateWishlistItemResponseDto>> {
		const existing = await this.repository.findItemById(id);
		if (!existing) {
			throw new WishlistItemNotFoundException();
		}
		if (dto.categoryId !== undefined) {
			const category = await this.repository.findCategoryById(dto.categoryId);
			if (!category) {
				throw new WishlistCategoryNotFoundException();
			}
		}
		const isUpdated = await this.repository.updateItem(id, dto);
		if (!isUpdated) {
			throw new WishlistItemNotFoundException();
		}
		await this.eventBus.publish(new WishlistDataChangedEvent());
		this.logger.log('Позиция wishlist обновлена', { itemId: id });
		return { id };
	}
}
