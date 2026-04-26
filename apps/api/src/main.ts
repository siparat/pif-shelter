import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { apiErrorSchema } from '@pif/contracts';
import { AUTH_PREFIX } from '@pif/shared';
import { AuthService } from '@thallesp/nestjs-better-auth';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Logger } from 'nestjs-pino';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app/app.module';
import type { AppAuth } from './app/configs/auth.config';
import { handleBetterAuthRequest } from './app/core/auth/better-auth-fastify.handler';
import { GlobalDeserializerInterceptor } from './app/core/interceptors/global-deserializer.interceptor';
import { ConfigService } from '@nestjs/config';

dayjs.locale('ru');
dayjs.extend(utc);
dayjs.extend(duration);

const PORT = 3000;

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
		bufferLogs: true
	});

	app.enableShutdownHooks();
	app.useLogger(app.get(Logger));
	app.enableCors({
		origin: app.get(ConfigService).getOrThrow('ALLOWED_ORIGINS').split(','),
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization']
	});

	await app.register(require('@fastify/helmet'));

	const auth = app.get(AuthService).instance as AppAuth;
	const fastify = app.getHttpAdapter().getInstance();

	fastify.route({
		method: ['GET', 'POST'],
		url: `/${AUTH_PREFIX}`,
		handler: (req, rep) =>
			handleBetterAuthRequest(auth, req as unknown as FastifyRequest, rep as unknown as FastifyReply)
	});
	fastify.route({
		method: ['GET', 'POST'],
		url: `/${AUTH_PREFIX}/*`,
		handler: (req, rep) =>
			handleBetterAuthRequest(auth, req as unknown as FastifyRequest, rep as unknown as FastifyReply)
	});

	const config = new DocumentBuilder().setTitle('ПИФ API').setVersion('0.1').build();
	const document = SwaggerModule.createDocument(app, config, {
		extraModels: [createZodDto(apiErrorSchema)]
	});
	const authDocument = await app.get(AuthService).api.generateOpenAPISchema({ path: AUTH_PREFIX });

	SwaggerModule.setup('openapi', app, document);
	SwaggerModule.setup('openapi/auth', app, authDocument as OpenAPIObject);

	app.useGlobalPipes(new ZodValidationPipe());
	app.useGlobalInterceptors(new GlobalDeserializerInterceptor());

	await app.listen(PORT, '0.0.0.0');
	app.get(Logger).log(`Application is running on http://0.0.0.0:${PORT}`);
}

bootstrap().catch((err) => {
	console.error('Bootstrap failed:', err);
	process.exit(1);
});
