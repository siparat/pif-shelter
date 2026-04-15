import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { CreateWishlistItemResponseDto, ReturnData } from '../../../core/dto';
import { WishlistDataChangedEvent } from '../../events/wishlist-data-changed/wishlist-data-changed.event';
import { WishlistCategoryNotFoundException } from '../../exceptions/wishlist-category-not-found.exception';
import { WishlistRepository } from '../../repositories/wishlist.repository';
import { CreateWishlistItemCommand } from './create-wishlist-item.command';

@CommandHandler(CreateWishlistItemCommand)
export class CreateWishlistItemHandler implements ICommandHandler<CreateWishlistItemCommand> {
	constructor(
		private readonly repository: WishlistRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ dto }: CreateWishlistItemCommand): Promise<ReturnData<typeof CreateWishlistItemResponseDto>> {
		const category = await this.repository.findCategoryById(dto.categoryId);
		if (!category) {
			throw new WishlistCategoryNotFoundException();
		}
		const id = await this.repository.createItem(dto);
		await this.eventBus.publish(new WishlistDataChangedEvent());
		this.logger.log('Позиция wishlist создана', { itemId: id, categoryId: dto.categoryId });
		return { id };
	}
}
