import { blacklist } from '@pif/database';
import { BlacklistSource } from '@pif/shared';

export interface IBlacklistSource {
	value: string;
	source: BlacklistSource;
}

export abstract class BlacklistRepository {
	abstract banContacts(moderatorId: string, reason: string, ...sources: IBlacklistSource[]): Promise<number>;
	abstract findByValue(value: string): Promise<typeof blacklist.$inferSelect | undefined>;
	abstract findByValue(values: string[]): Promise<(typeof blacklist.$inferSelect)[]>;
}
