import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { IApiErrorResponse } from '@pif/shared';
import { FastifyReply } from 'fastify';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
	catch(exception: ThrottlerException, host: ArgumentsHost): void {
		const res = host.switchToHttp().getResponse<FastifyReply>();
		const json: IApiErrorResponse = {
			success: false,
			error: {
				code: 'TOO_MANY_REQUESTS',
				message: 'Слишком много запросов'
			}
		};
		res.status(exception.getStatus()).send(json);
	}
}
