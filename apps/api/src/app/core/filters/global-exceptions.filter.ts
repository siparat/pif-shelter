import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { IApiErrorResponse } from '@pif/shared';
import { Response } from 'express';
import { Logger } from 'nestjs-pino';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
	constructor(private readonly logger: Logger) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		// Error Health Check (503)
		if (status === HttpStatus.SERVICE_UNAVAILABLE && exception instanceof HttpException) {
			response.status(status).json(exception.getResponse());
			return;
		}

		const message =
			exception instanceof HttpException || exception instanceof Error
				? exception.message
				: 'Внутренняя ошибка сервера';
		const code = exception instanceof HttpException ? exception.name : 'INTERNAL_SERVER_ERROR';

		if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
			this.logger.error(exception);
		}

		const errorResponse: IApiErrorResponse = {
			success: false,
			error: {
				code,
				message
			}
		};

		response.status(status).json(errorResponse);
	}
}
