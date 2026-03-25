import { NotFoundException } from '@nestjs/common';

export class DonationIntentNotFoundException extends NotFoundException {
	constructor(transactionId: string) {
		super(`Намерение разового доната с transactionId ${transactionId} не найдено`);
	}
}
