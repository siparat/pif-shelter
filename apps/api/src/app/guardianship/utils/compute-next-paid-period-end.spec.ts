import { GUARDIANSHIP_BILLING_PERIOD_MONTHS } from '@pif/shared';
import dayjs from 'dayjs';
import { computeNextPaidPeriodEnd, computeRenewalPaidPeriodEnd } from './compute-next-paid-period-end';

describe('computeNextPaidPeriodEnd', () => {
	it('adds billing period months from anchor date', () => {
		const from = new Date('2026-01-10T12:00:00.000Z');
		const end = computeNextPaidPeriodEnd(from);
		expect(dayjs(end).diff(dayjs(from), 'month')).toBe(GUARDIANSHIP_BILLING_PERIOD_MONTHS);
	});
});

describe('computeRenewalPaidPeriodEnd', () => {
	it('extends from paidPeriodEndAt when it is in the future', () => {
		const now = new Date('2026-01-10T12:00:00.000Z');
		const paidPeriodEndAt = new Date('2026-06-01T00:00:00.000Z');
		const next = computeRenewalPaidPeriodEnd({ paidPeriodEndAt }, now);
		expect(next.getTime()).toBeGreaterThan(paidPeriodEndAt.getTime());
	});

	it('extends from now when paidPeriodEndAt is absent or past', () => {
		const now = new Date('2026-01-10T12:00:00.000Z');
		const past = new Date('2025-01-01T00:00:00.000Z');
		const nextFromPast = computeRenewalPaidPeriodEnd({ paidPeriodEndAt: past }, now);
		expect(nextFromPast.getTime()).toBeGreaterThan(now.getTime());
		const nextFromNull = computeRenewalPaidPeriodEnd({ paidPeriodEndAt: null }, now);
		expect(nextFromNull.getTime()).toBeGreaterThan(now.getTime());
	});
});
