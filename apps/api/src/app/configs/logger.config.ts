import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@pif/config';
import { Request } from 'express';
import { LoggerModuleAsyncParams } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';

export const getLoggerConfig = (): LoggerModuleAsyncParams => ({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (config: ConfigService) => {
		const isProduction = config.get('NODE_ENV') === 'production';
		return {
			pinoHttp: {
				genReqId: (req: Request) => req.headers['x-request-id'] ?? randomUUID(),
				level: isProduction ? 'info' : 'debug',
				transport: isProduction
					? undefined
					: {
							target: 'pino-pretty',
							options: {
								colorize: true,
								singleLine: true,
								translateTime: 'SYS:standard'
							}
						},
				redact: {
					paths: [
						'req.headers.authorization',
						'req.headers.cookie',
						'body.password',
						'body.token',
						'body.email',
						'body.phone'
					],
					censor: '***'
				},
				autoLogging: {
					ignore: (req: Request) => req.url === '/health'
				}
			}
		};
	}
});
