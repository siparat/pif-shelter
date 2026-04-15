import { CreateWishlistItemRequestDto } from '../../../core/dto';

export class CreateWishlistItemCommand {
	constructor(public readonly dto: CreateWishlistItemRequestDto) {}
}
