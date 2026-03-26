import { NotFoundException } from '@nestjs/common';

export class DonationSubscriptionNotFoundByCancellationTokenException extends NotFoundException {
	constructor() {
		super('Донат-подписка для указанного токена отмены не найдена');
	}
}
