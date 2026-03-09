import { Injectable } from '@nestjs/common';
import { botHelpConfig, DatabaseService } from '@pif/database';
import type { IHelpMessageProps } from '../messages/help.message';
import { BotHelpConfigRepository } from './bot-help-config.repository';

const HELP_KEYS = {
	contacts: 'help_contacts',
	address: 'help_address',
	visitingRules: 'help_visiting_rules',
	siteUrl: 'help_site_url'
} as const;

@Injectable()
export class DrizzleBotHelpConfigRepository extends BotHelpConfigRepository {
	constructor(private readonly db: DatabaseService) {
		super();
	}

	async getHelpContent(): Promise<IHelpMessageProps> {
		const rows = await this.db.client.select().from(botHelpConfig);
		const byKey = (key: string): string | undefined => rows.find((r) => r.key === key)?.value;
		return {
			contacts: byKey(HELP_KEYS.contacts),
			address: byKey(HELP_KEYS.address),
			visitingRules: byKey(HELP_KEYS.visitingRules),
			siteUrl: byKey(HELP_KEYS.siteUrl)
		};
	}
}
