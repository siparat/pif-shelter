import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { ReturnData, UpdateWishlistCategoryResponseDto } from '../../../core/dto';
import { WishlistDataChangedEvent } from '../../events/wishlist-data-changed/wishlist-data-changed.event';
import { WishlistCategoryNotFoundException } from '../../exceptions/wishlist-category-not-found.exception';
import { WishlistRepository } from '../../repositories/wishlist.repository';
import { UpdateWishlistCategoryCommand } from './update-wishlist-category.command';

@CommandHandler(UpdateWishlistCategoryCommand)
export class UpdateWishlistCategoryHandler implements ICommandHandler<UpdateWishlistCategoryCommand> {
	constructor(
		private readonly repository: WishlistRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({
		id,
		dto
	}: UpdateWishlistCategoryCommand): Promise<ReturnData<typeof UpdateWishlistCategoryResponseDto>> {
		const isUpdated = await this.repository.updateCategory(id, dto);
		if (!isUpdated) {
			throw new WishlistCategoryNotFoundException();
		}
		await this.eventBus.publish(new WishlistDataChangedEvent());
		this.logger.log('Категория wishlist обновлена', { categoryId: id });
		return { id };
	}
}
