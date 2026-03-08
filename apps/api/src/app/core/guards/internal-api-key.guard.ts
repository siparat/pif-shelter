import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const INTERNAL_SECRET_HEADER = 'x-internal-secret';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
	constructor(private readonly config: ConfigService) {}

	canActivate(context: ExecutionContext): boolean {
		const secret = this.config.get<string>('TELEGRAM_BOT_INTERNAL_SECRET');
		if (!secret) {
			throw new UnauthorizedException('Internal API secret не настроен');
		}
		const request = context.switchToHttp().getRequest();
		const header = request.headers[INTERNAL_SECRET_HEADER] ?? request.headers['X-Internal-Secret'];
		if (header !== secret) {
			throw new UnauthorizedException('Неверный секретный ключ');
		}
		return true;
	}
}
