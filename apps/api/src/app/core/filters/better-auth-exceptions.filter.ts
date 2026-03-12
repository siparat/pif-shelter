import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { IApiErrorResponse } from '@pif/shared';
import { APIError } from 'better-auth';
import { FastifyReply } from 'fastify';

@Catch(APIError)
export class BetterAuthExceptionsFilter implements ExceptionFilter {
	catch(exception: APIError, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<FastifyReply>();

		const errorResponse: IApiErrorResponse = {
			success: false,
			error: {
				code: exception.body?.code ?? exception.status.toString(),
				message: exception.message
			}
		};

		response.status(exception.statusCode).send(errorResponse);
	}
}
