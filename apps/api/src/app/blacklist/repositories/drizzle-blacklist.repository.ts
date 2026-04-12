import { Injectable } from '@nestjs/common';
import { blacklist, DatabaseService, meetingRequests } from '@pif/database';
import { BlacklistContext, BlacklistSource, BlacklistStatus } from '@pif/shared';
import { and, eq, inArray, lt, or } from 'drizzle-orm';
import { BlacklistRepository, IBlacklistBuildedContacts, IBlacklistSource } from './blacklist.repository';

@Injectable()
export class DrizzleBlacklistRepository extends BlacklistRepository {
	constructor(private readonly database: DatabaseService) {
		super();
	}

	async approveContacts(
		moderatorId: string,
		context: BlacklistContext,
		...sources: IBlacklistSource[]
	): Promise<number> {
		if (!sources.length) {
			return 0;
		}
		return await this.database.client.transaction(async (tx): Promise<number> => {
			const common: Partial<typeof blacklist.$inferInsert> = {
				appealedAt: new Date(),
				context,
				status: BlacklistStatus.APPEALED,
				moderatorId,
				reason: null,
				blockedAt: null,
				expiredAt: null
			};

			return this.updateContacts(tx, sources, common, false);
		});
	}

	async banContacts(
		moderatorId: string,
		reason: string,
		context: BlacklistContext,
		...sources: IBlacklistSource[]
	): Promise<number> {
		if (!sources.length) {
			return 0;
		}
		return await this.database.client.transaction(async (tx): Promise<number> => {
			const common: Partial<typeof blacklist.$inferInsert> = {
				blockedAt: new Date(),
				context,
				status: BlacklistStatus.BLOCKED,
				moderatorId,
				reason,
				appealedAt: null,
				expiredAt: null
			};

			return this.updateContacts(tx, sources, common, true);
		});
	}

	async suspectContacts(
		moderatorId: string | null,
		reason: string,
		context: BlacklistContext,
		endsAt: Date,
		...sources: IBlacklistSource[]
	): Promise<number> {
		if (!sources.length) {
			return 0;
		}

		return this.database.client.transaction(async (tx): Promise<number> => {
			const common: Partial<typeof blacklist.$inferInsert> = {
				expiredAt: endsAt,
				moderatorId,
				reason,
				context,
				status: BlacklistStatus.SUSPICION
			};

			return this.updateContacts(tx, sources, common, true);
		});
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

	async delete(id: string): Promise<number> {
		const list = await this.database.client
			.delete(blacklist)
			.where(eq(blacklist.id, id))
			.returning({ id: blacklist.id });
		return list.length;
	}

	async markSuspicionAsExpired(now: Date): Promise<number> {
		const list = await this.database.client
			.update(blacklist)
			.set({ status: BlacklistStatus.SUSPICION_EXPIRED, expiredAt: now })
			.where(and(eq(blacklist.status, BlacklistStatus.SUSPICION), lt(blacklist.expiredAt, now)))
			.returning({ id: blacklist.id });
		return list.length;
	}

	private async updateContacts(
		tx: Parameters<Parameters<typeof this.database.client.transaction>[0]>[0],
		sources: IBlacklistSource[],
		common: Partial<typeof blacklist.$inferInsert>,
		asSuspicious: boolean
	): Promise<number> {
		const { phones, emails, contacts } = this.buildContactsWithoutDublicates(sources, common);

		const { rowCount } = await tx
			.insert(blacklist)
			.values(contacts)
			.onConflictDoUpdate({ target: [blacklist.source, blacklist.value], set: common });

		const meetingConditions = [];
		if (emails.length) meetingConditions.push(inArray(meetingRequests.email, emails));
		if (phones.length) meetingConditions.push(inArray(meetingRequests.phone, phones));
		if (meetingConditions.length) {
			await tx
				.update(meetingRequests)
				.set({ isSuspicious: asSuspicious })
				.where(or(...meetingConditions));
		}

		return rowCount || 0;
	}

	private buildContactsWithoutDublicates(
		sources: IBlacklistSource[],
		common: Partial<typeof blacklist.$inferInsert>
	): IBlacklistBuildedContacts {
		const keys: Set<string> = new Set();
		const emails: string[] = [];
		const phones: string[] = [];
		const telegrams: string[] = [];

		const contacts = sources.reduce(
			(acc: (typeof blacklist.$inferInsert)[], { value, source }: IBlacklistSource) => {
				const key = `${source}:${value}`;
				if (keys.has(key)) {
					return acc;
				}
				switch (source) {
					case BlacklistSource.EMAIL: {
						emails.push(value);
						break;
					}
					case BlacklistSource.PHONE: {
						phones.push(value);
						break;
					}
					case BlacklistSource.TELEGRAM: {
						telegrams.push(value);
						break;
					}
				}
				keys.add(key);
				acc.push({
					context: BlacklistContext.MANUAL,
					...common,
					value,
					source
				});
				return acc;
			},
			[]
		);

		return { contacts, phones, emails, telegrams };
	}
}
