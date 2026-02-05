import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env.schema';

@Injectable()
export class ApiConfigService {
	constructor(private readonly configService: ConfigService<Env, true>) {}

	get port(): number {
		return this.configService.get('PORT', { infer: true });
	}

	get isProduction(): boolean {
		return (
			this.configService.get('NODE_ENV', { infer: true }) === 'production'
		);
	}

	get database(): { url: string } {
		return {
			url: this.configService.get('DATABASE_URL', { infer: true }),
		};
	}

	get auth(): { jwtSecret: string } {
		return {
			jwtSecret: this.configService.get('JWT_SECRET', { infer: true }),
		};
	}
}
