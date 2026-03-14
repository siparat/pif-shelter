import { Logger } from '@nestjs/common';
import { IApiErrorResponse } from '@pif/shared';
import { FastifyReply, FastifyRequest } from 'fastify';
import type { AppAuth } from '../../configs/auth.config';

export async function handleBetterAuthRequest(
	auth: AppAuth,
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	try {
		const url = new URL(request.url, `${request.protocol}://${request.headers.host}`);
		const headers = new Headers();
		for (const [key, value] of Object.entries(request.headers)) {
			if (value !== undefined) {
				headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
			}
		}
		const init: RequestInit = {
			method: request.method,
			headers
		};
		if (request.body !== undefined && request.method !== 'GET') {
			init.body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
		}
		const req = new Request(url.toString(), init);
		const response = await auth.handler(req);
		reply.status(response.status);
		response.headers.forEach((value, key) => {
			reply.header(key, value);
		});
		const body = response.body ? await response.text() : null;
		await reply.send(body);
	} catch (err) {
		Logger.error('Internal authentication error', err);
		const errorResponse: IApiErrorResponse = {
			success: false,
			error: {
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Internal authentication error'
			}
		};
		reply.status(500).send(errorResponse);
	}
}
