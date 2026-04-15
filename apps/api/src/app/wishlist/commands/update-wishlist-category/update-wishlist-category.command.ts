import { UpdateWishlistCategoryRequestDto } from '../../../core/dto';

export class UpdateWishlistCategoryCommand {
	constructor(
		public readonly id: string,
		public readonly dto: UpdateWishlistCategoryRequestDto
	) {}
}
