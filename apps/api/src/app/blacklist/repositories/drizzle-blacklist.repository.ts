import { Injectable } from '@nestjs/common';
import { blacklist, DatabaseService, meetingRequests } from '@pif/database';
import { BlacklistContext, BlacklistSource, BlacklistStatus } from '@pif/shared';
import { eq, inArray, or } from 'drizzle-orm';
import { BlacklistRepository, IBlacklistSource } from './blacklist.repository';

@Injectable()
export class DrizzleBlacklistRepository extends BlacklistRepository {
	constructor(private readonly database: DatabaseService) {
		super();
	}

	async banContacts(moderatorId: string, reason: string, ...sources: IBlacklistSource[]): Promise<number> {
		if (!sources.length) {
			return 0;
		}
		const updatedCountRows = await this.database.client.transaction(async (tx): Promise<number> => {
			const common = {
				blockedAt: new Date(),
				context: BlacklistContext.MANUAL,
				status: BlacklistStatus.BLOCKED,
				moderatorId,
				reason,
				appealedAt: null,
				expiredAt: null
			};

			const keys: Set<string> = new Set();
			const phones: string[] = [];
			const emails: string[] = [];

			const values = sources.reduce(
				(acc: (typeof blacklist.$inferInsert)[], { value, source }: IBlacklistSource) => {
					const key = `${source}:${value}`;
					if (keys.has(key)) {
						return acc;
					}
					switch (source) {
						case BlacklistSource.PHONE: {
							phones.push(value);
							break;
						}
						case BlacklistSource.EMAIL: {
							emails.push(value);
							break;
						}
					}
					keys.add(key);
					acc.push({
						...common,
						value,
						source
					});
					return acc;
				},
				[]
			);

			const { rowCount } = await tx
				.insert(blacklist)
				.values(values)
				.onConflictDoUpdate({ target: [blacklist.source, blacklist.value], set: common });

			const meetingConditions = [];
			if (emails.length) meetingConditions.push(inArray(meetingRequests.email, emails));
			if (phones.length) meetingConditions.push(inArray(meetingRequests.phone, phones));
			if (meetingConditions.length) {
				await tx
					.update(meetingRequests)
					.set({ isSuspicious: true })
					.where(or(...meetingConditions));
			}

			return rowCount || 0;
		});

		return updatedCountRows;
	}

	async findByValue(value: string): Promise<typeof blacklist.$inferSelect | undefined>;
	async findByValue(values: string[]): Promise<(typeof blacklist.$inferSelect)[]>;
	async findByValue(
		values: string | string[]
	): Promise<(typeof blacklist.$inferSelect)[] | typeof blacklist.$inferSelect | undefined> {
		const isArray = Array.isArray(values);
		const result = await this.database.client
			.select()
			.from(blacklist)
			.where(isArray ? inArray(blacklist.value, values) : eq(blacklist.value, values));

		if (isArray) {
			return result;
		}
		return result[0];
	}
}
