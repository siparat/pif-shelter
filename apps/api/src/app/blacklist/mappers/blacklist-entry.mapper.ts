import { BlacklistEntry } from '@pif/contracts';
import { blacklist } from '@pif/database';

type BlacklistRow = typeof blacklist.$inferSelect;

export class BlacklistEntryMapper {
	static toEntry(row: BlacklistRow): BlacklistEntry {
		return {
			id: row.id,
			context: row.context,
			source: row.source,
			value: row.value,
			reason: row.reason,
			status: row.status,
			moderatorId: row.moderatorId,
			expiredAt: row.expiredAt?.toISOString() ?? null,
			blockedAt: row.blockedAt?.toISOString() ?? null,
			appealedAt: row.appealedAt?.toISOString() ?? null,
			addedAt: row.addedAt?.toISOString() ?? null
		};
	}
}
