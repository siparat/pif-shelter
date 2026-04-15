import { UpdateWishlistItemRequestDto } from '../../../core/dto';

export class UpdateWishlistItemCommand {
	constructor(
		public readonly id: string,
		public readonly dto: UpdateWishlistItemRequestDto
	) {}
}
