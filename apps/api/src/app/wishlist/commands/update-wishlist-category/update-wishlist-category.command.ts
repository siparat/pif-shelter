import { UpdateWishlistCategoryRequestDto } from '@pif/contracts';

export class UpdateWishlistCategoryCommand {
	constructor(
		public readonly id: string,
		public readonly dto: UpdateWishlistCategoryRequestDto
	) {}
}
