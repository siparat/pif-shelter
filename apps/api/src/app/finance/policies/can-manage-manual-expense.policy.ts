import { Injectable } from '@nestjs/common';
import { UserRole } from '@pif/shared';
import { ForbiddenManualExpenseException } from '../exceptions/forbidden-manual-expense.exception';

@Injectable()
export class CanManageManualExpensePolicy {
	assertCanUpdateOrDelete(createdByUserId: string | null, actorId: string, actorRole: UserRole): void {
		if (actorRole === UserRole.ADMIN || actorRole === UserRole.SENIOR_VOLUNTEER) {
			return;
		}

		if (createdByUserId === actorId) {
			return;
		}

		throw new ForbiddenManualExpenseException();
	}
}
