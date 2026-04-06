import { CreateWishlistCategoryRequestDto } from '@pif/contracts';

export class CreateWishlistCategoryCommand {
	constructor(public readonly dto: CreateWishlistCategoryRequestDto) {}
}
