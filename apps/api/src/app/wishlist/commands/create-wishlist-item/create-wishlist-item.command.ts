import { CreateWishlistItemRequestDto } from '@pif/contracts';

export class CreateWishlistItemCommand {
	constructor(public readonly dto: CreateWishlistItemRequestDto) {}
}
