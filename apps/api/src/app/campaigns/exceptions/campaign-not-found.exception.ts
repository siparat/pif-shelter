import { NotFoundException } from '@nestjs/common';

export class CampaignNotFoundException extends NotFoundException {
	constructor() {
		super('Срочный сбор не найден');
	}
}
