import { NotFoundException } from '@nestjs/common';

export class WishlistCategoryNotFoundException extends NotFoundException {
	constructor() {
		super('Категория списка нужд не найдена');
	}
}
