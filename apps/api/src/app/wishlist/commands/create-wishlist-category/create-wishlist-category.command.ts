import { CreateWishlistCategoryRequestDto } from '../../../core/dto';

export class CreateWishlistCategoryCommand {
	constructor(public readonly dto: CreateWishlistCategoryRequestDto) {}
}
