import { GUARDIANSHIP_BILLING_PERIOD_MONTHS } from '@pif/shared';
import dayjs from 'dayjs';

export function computeNextPaidPeriodEnd(from: Date): Date {
	return dayjs(from).add(GUARDIANSHIP_BILLING_PERIOD_MONTHS, 'month').toDate();
}

export function computeRenewalPaidPeriodEnd(guardianship: { paidPeriodEndAt: Date | null }, now: Date): Date {
	const base =
		guardianship.paidPeriodEndAt != null && guardianship.paidPeriodEndAt > now ? guardianship.paidPeriodEndAt : now;
	return computeNextPaidPeriodEnd(base);
}
