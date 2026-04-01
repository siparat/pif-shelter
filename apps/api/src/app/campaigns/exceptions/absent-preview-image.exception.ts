import { BadRequestException } from '@nestjs/common';

export class AbsentPreviewImage extends BadRequestException {
	constructor() {
		super('Вы не загрузили фото для сбора');
	}
}
