import { GuardianshipStatusEnum } from '@pif/shared';
import { resolveGuardianPrivilegesUntilForCancel } from './resolve-guardian-privileges-until-for-cancel';

describe('resolveGuardianPrivilegesUntilForCancel', () => {
	const paidUntil = new Date('2030-01-15');

	it('returns null when refund expected', () => {
		expect(
			resolveGuardianPrivilegesUntilForCancel(
				{ status: GuardianshipStatusEnum.ACTIVE, paidPeriodEndAt: paidUntil },
				true
			)
		).toBeNull();
	});

	it('returns null when status is not ACTIVE', () => {
		expect(
			resolveGuardianPrivilegesUntilForCancel(
				{ status: GuardianshipStatusEnum.PENDING_PAYMENT, paidPeriodEndAt: paidUntil },
				false
			)
		).toBeNull();
	});

	it('returns paidPeriodEndAt when ACTIVE without refund', () => {
		expect(
			resolveGuardianPrivilegesUntilForCancel(
				{ status: GuardianshipStatusEnum.ACTIVE, paidPeriodEndAt: paidUntil },
				false
			)
		).toEqual(paidUntil);
	});

	it('returns null when ACTIVE but paidPeriodEndAt missing', () => {
		expect(
			resolveGuardianPrivilegesUntilForCancel(
				{ status: GuardianshipStatusEnum.ACTIVE, paidPeriodEndAt: null },
				false
			)
		).toBeNull();
	});
});
