import { Injectable } from '@nestjs/common';
import { guardianships } from '@pif/database';
import { GuardianshipStatusEnum } from '@pif/shared';
import { GuardianshipNotFoundException } from '../../exceptions/guardianship-not-found.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { GuardianshipNotOwnedByGuardianException } from '../../exceptions/guardianship-not-owned-by-guardian.exception';

@Injectable()
export class CancelGuardianshipAsGuardianPolicy {
	constructor(private readonly repository: GuardianshipRepository) {}

	async assertCanCancelAsGuardian(
		guardianshipId: string,
		guardianUserId: string
	): Promise<{ guardianship: typeof guardianships.$inferSelect; isAlreadyTerminal: boolean }> {
		const guardianship = await this.repository.findById(guardianshipId);
		if (!guardianship) {
			throw new GuardianshipNotFoundException();
		}
		if (guardianship.status === GuardianshipStatusEnum.CANCELLED) {
			return { guardianship, isAlreadyTerminal: true };
		}
		if (guardianship.guardianUserId !== guardianUserId) {
			throw new GuardianshipNotOwnedByGuardianException();
		}
		return { guardianship, isAlreadyTerminal: false };
	}
}
