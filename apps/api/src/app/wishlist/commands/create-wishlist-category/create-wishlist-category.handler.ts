import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { CreateWishlistCategoryResponseDto, ReturnData } from '../../../core/dto';
import { WishlistDataChangedEvent } from '../../events/wishlist-data-changed/wishlist-data-changed.event';
import { WishlistRepository } from '../../repositories/wishlist.repository';
import { CreateWishlistCategoryCommand } from './create-wishlist-category.command';

@CommandHandler(CreateWishlistCategoryCommand)
export class CreateWishlistCategoryHandler implements ICommandHandler<CreateWishlistCategoryCommand> {
	constructor(
		private readonly repository: WishlistRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({
		dto
	}: CreateWishlistCategoryCommand): Promise<ReturnData<typeof CreateWishlistCategoryResponseDto>> {
		const id = await this.repository.createCategory(dto);
		await this.eventBus.publish(new WishlistDataChangedEvent());
		this.logger.log('Категория wishlist создана', { categoryId: id });
		return { id };
	}
}
