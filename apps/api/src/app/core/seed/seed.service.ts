import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { botHelpConfig, DatabaseService } from '@pif/database';
import { UserRole } from '@pif/shared';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { eq } from 'drizzle-orm';
import { Logger } from 'nestjs-pino';
import { AppAuth } from '../../configs/auth.config';

const BOT_HELP_KEYS = [
	'BOT_HELP_CONTACTS',
	'BOT_HELP_ADDRESS',
	'BOT_HELP_VISITING_RULES',
	'BOT_HELP_SITE_URL'
] as const;

const BOT_HELP_CONFIG_KEY_MAP: Record<(typeof BOT_HELP_KEYS)[number], string> = {
	BOT_HELP_CONTACTS: 'help_contacts',
	BOT_HELP_ADDRESS: 'help_address',
	BOT_HELP_VISITING_RULES: 'help_visiting_rules',
	BOT_HELP_SITE_URL: 'help_site_url'
};

@Injectable()
export class SeedService implements OnApplicationBootstrap {
	constructor(
		private configService: ConfigService,
		private authService: AuthService<AppAuth>,
		private database: DatabaseService,
		private logger: Logger
	) {}

	async onApplicationBootstrap(): Promise<void> {
		await this.seedAdmin();
		await this.seedBotHelpConfig();
	}

	private async seedBotHelpConfig(): Promise<void> {
		try {
			for (const envKey of BOT_HELP_KEYS) {
				const value = this.configService.get<string>(envKey);
				if (value == null || value === '') continue;
				const key = BOT_HELP_CONFIG_KEY_MAP[envKey];
				const existing = await this.database.client
					.select()
					.from(botHelpConfig)
					.where(eq(botHelpConfig.key, key))
					.limit(1);
				if (existing.length > 0) {
					continue;
				}

				await this.database.client.insert(botHelpConfig).values({ key, value });
			}
		} catch (error) {
			this.logger.error('Failed to seed bot help config', error);
		}
	}

	private async seedAdmin(): Promise<void> {
		const email = this.configService.getOrThrow<string>('ADMIN_EMAIL');
		const password = this.configService.getOrThrow<string>('ADMIN_PASSWORD');
		const telegram = this.configService.getOrThrow<string>('ADMIN_TELEGRAM');

		try {
			const existingAdmin = await this.database.client.query.users.findFirst({
				where: { email }
			});

			if (existingAdmin) {
				return;
			}

			this.logger.log(`Creating default admin user: ${email}`);

			await this.authService.api.signUpEmail({
				body: {
					email,
					password,
					telegram,
					name: 'Administrator',
					role: UserRole.ADMIN,
					position: 'System'
				}
			});

			this.logger.log('Default admin user created successfully');
		} catch (error) {
			this.logger.error('Failed to seed admin user', error);
		}
	}
}
