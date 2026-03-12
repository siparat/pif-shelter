import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { IApiErrorResponse } from '@pif/shared';
import { FastifyReply } from 'fastify';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
	catch(exception: ZodValidationException, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<FastifyReply>();
		const status = HttpStatus.BAD_REQUEST;

		const zodError = exception.getZodError() as ZodError;

		const errorResponse: IApiErrorResponse = {
			success: false,
			error: {
				code: 'VALIDATION_ERROR',
				message: 'Ошибка валидации входящих данных',
				details: zodError.issues.map((error) => ({
					path: error.path.join('.'),
					message: error.message
				}))
			}
		};

		response.status(status).send(errorResponse);
	}
}
