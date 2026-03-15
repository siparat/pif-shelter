import { NotFoundException } from '@nestjs/common';

export class PostNotFoundException extends NotFoundException {
	constructor(postId: string) {
		super(`Пост с ID ${postId} не найден`);
	}
}
