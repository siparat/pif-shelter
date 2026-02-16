import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '@pif/database';
import { UserRole } from '@pif/shared';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Logger } from 'nestjs-pino';
import { AppAuth } from '../../configs/auth.config';

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
	}

	private async seedAdmin(): Promise<void> {
		const email = this.configService.getOrThrow<string>('ADMIN_EMAIL');
		const password = this.configService.getOrThrow<string>('ADMIN_PASSWORD');

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
