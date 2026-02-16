import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@pif/config';
import { LoggerModuleAsyncParams, Params } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { IncomingMessage } from 'node:http';
import { ReqId } from 'pino-http';

export const getLoggerConfig = (): LoggerModuleAsyncParams => ({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (config: ConfigService): Params => {
		const isProduction = config.get('NODE_ENV') === 'production';
		return {
			pinoHttp: {
				genReqId: (req: IncomingMessage): ReqId => req.headers['x-request-id'] ?? randomUUID(),
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
					ignore: (req: IncomingMessage) => req.url === '/health'
				}
			}
		};
	}
});
