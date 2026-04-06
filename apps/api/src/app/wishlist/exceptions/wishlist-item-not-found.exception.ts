import { NotFoundException } from '@nestjs/common';

export class WishlistItemNotFoundException extends NotFoundException {
	constructor() {
		super('Позиция списка нужд не найдена');
	}
}
