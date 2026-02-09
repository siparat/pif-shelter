import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { IApiErrorResponse } from '@pif/types';
import { Response } from 'express';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionsFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
		const message = exception instanceof HttpException ? exception.message : 'Внутренняя ошибка сервера';
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
