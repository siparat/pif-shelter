import { BadRequestException } from '@nestjs/common';
import { CampaignStatus } from '@pif/shared';

export class InvalidCampaignStatusTransitionException extends BadRequestException {
	constructor(from: CampaignStatus, to: CampaignStatus) {
		super(`Недопустимый переход статуса сбора: ${from} -> ${to}`);
	}
}
