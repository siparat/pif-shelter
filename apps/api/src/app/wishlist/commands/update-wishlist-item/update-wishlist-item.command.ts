import { UpdateWishlistItemRequestDto } from '@pif/contracts';

export class UpdateWishlistItemCommand {
	constructor(
		public readonly id: string,
		public readonly dto: UpdateWishlistItemRequestDto
	) {}
}
