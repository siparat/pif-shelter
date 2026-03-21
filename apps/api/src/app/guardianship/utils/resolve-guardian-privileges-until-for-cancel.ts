import { GuardianshipStatusEnum } from '@pif/shared';

export function resolveGuardianPrivilegesUntilForCancel(
	guardianship: { status: GuardianshipStatusEnum; paidPeriodEndAt: Date | null },
	isRefundExpected: boolean
): Date | null {
	if (isRefundExpected) {
		return null;
	}
	if (guardianship.status !== GuardianshipStatusEnum.ACTIVE) {
		return null;
	}
	return guardianship.paidPeriodEndAt ?? null;
}
