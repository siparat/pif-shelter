import { ForbiddenException } from '@nestjs/common';

export class PostReactionNotPossibleException extends ForbiddenException {
	constructor() {
		super('Нельзя ставить реакцию на приватный пост');
	}
}
