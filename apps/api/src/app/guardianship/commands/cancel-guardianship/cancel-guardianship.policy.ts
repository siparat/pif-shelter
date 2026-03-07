import { Injectable } from '@nestjs/common';
import { guardianships } from '@pif/database';
import { GuardianshipStatusEnum } from '@pif/shared';
import { GuardianshipNotFoundException } from '../../exceptions/guardianship-not-found.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';

type GuardianshipRow = typeof guardianships.$inferSelect;

@Injectable()
export class CancelGuardianshipPolicy {
	constructor(private readonly repository: GuardianshipRepository) {}

	async assertCanCancel(
		guardianshipId: string
	): Promise<{ guardianship: GuardianshipRow; isAlreadyTerminal: boolean }> {
		const guardianship = await this.repository.findById(guardianshipId);
		if (!guardianship) {
			throw new GuardianshipNotFoundException();
		}

		return { guardianship, isAlreadyTerminal: guardianship.status == GuardianshipStatusEnum.CANCELLED };
	}
}
