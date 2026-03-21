import { GuardianshipStatusEnum } from '@pif/shared';
import { SQL, and, eq, gt, isNotNull, or, sql } from 'drizzle-orm';
import { guardianships } from '../schemas/guardianships.schema';

export function guardianshipPortalAccessWhere(now: Date, filters: { guardianUserId?: string; animalId?: string }): SQL {
	const portal: SQL =
		or(
			eq(guardianships.status, GuardianshipStatusEnum.ACTIVE),
			and(
				eq(guardianships.status, GuardianshipStatusEnum.CANCELLED),
				isNotNull(guardianships.guardianPrivilegesUntil),
				gt(guardianships.guardianPrivilegesUntil, now)
			)
		) ?? sql`false`;
	const parts: [SQL, ...SQL[]] = [portal];
	if (filters.guardianUserId != null) {
		parts.push(eq(guardianships.guardianUserId, filters.guardianUserId));
	}
	if (filters.animalId != null) {
		parts.push(eq(guardianships.animalId, filters.animalId));
	}
	if (parts.length === 1) {
		return parts[0];
	}
	const combined = and(...parts);
	return combined ?? portal;
}
