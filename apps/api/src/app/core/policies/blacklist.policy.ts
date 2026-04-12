import { ForbiddenException, Injectable } from '@nestjs/common';
import { blacklist, DatabaseService } from '@pif/database';
import { BlacklistSource, BlacklistStatus } from '@pif/shared';
import { and, count, eq, inArray, or } from 'drizzle-orm';

export interface IBlacklistPolicyItem {
	source: BlacklistSource;
	value: string;
}

@Injectable()
export class BlacklistPolicy {
	constructor(private db: DatabaseService) {}

	async assertCleanContacts(items: IBlacklistPolicyItem[]): Promise<void> {
		const conditions = items.reduce<Partial<Record<BlacklistSource, string[]>>>((acc, curr) => {
			const arr: string[] = acc[curr.source] || [];
			arr.push(curr.value);
			acc[curr.source] = arr;
			return acc;
		}, {});

		const [{ result }] = await this.db.client
			.select({ result: count() })
			.from(blacklist)
			.where(
				or(
					...Object.entries(conditions).map(([source, values]) =>
						and(
							inArray(blacklist.status, [BlacklistStatus.SUSPICION, BlacklistStatus.BLOCKED]),
							eq(blacklist.source, source as BlacklistSource),
							values.length == 1 ? eq(blacklist.value, values[0]) : inArray(blacklist.value, values)
						)
					)
				)
			);

		if (result > 0) {
			throw new ForbiddenException('Указанный контакт находится в черном списке');
		}
	}
}
