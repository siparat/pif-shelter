import { blacklist } from '@pif/database';
import { BlacklistContext, BlacklistSource } from '@pif/shared';

export interface IBlacklistBuildedContacts {
	contacts: (typeof blacklist.$inferInsert)[];
	emails: string[];
	phones: string[];
	telegrams: string[];
}

export interface IBlacklistSource {
	value: string;
	source: BlacklistSource;
}

export abstract class BlacklistRepository {
	abstract banContacts(
		moderatorId: string,
		reason: string,
		context: BlacklistContext,
		...sources: IBlacklistSource[]
	): Promise<number>;
	abstract suspectContacts(
		moderatorId: string,
		reason: string,
		context: BlacklistContext,
		endsAt: Date,
		...sources: IBlacklistSource[]
	): Promise<number>;
	abstract findByValue(value: string): Promise<typeof blacklist.$inferSelect | undefined>;
	abstract findByValue(values: string[]): Promise<(typeof blacklist.$inferSelect)[]>;
	abstract delete(id: string): Promise<number>;
}
