import { ForbiddenException } from '@nestjs/common';

export class PostReactionForbiddenException extends ForbiddenException {
	constructor() {
		super(`Нельзя ставить реакцию на приватный пост`);
	}
}
