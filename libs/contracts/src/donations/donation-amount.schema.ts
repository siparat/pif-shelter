import { DONATION_MAX_AMOUNT_KOPECKS, DONATION_MIN_AMOUNT_KOPECKS } from '@pif/shared';
import { z } from 'zod';

export const donationAmountKopecksSchema = z
	.number()
	.int('Сумма в целых копейках')
	.min(DONATION_MIN_AMOUNT_KOPECKS)
	.max(DONATION_MAX_AMOUNT_KOPECKS);
