import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ApiErrorResponseDto } from '@pif/contracts';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Logger } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app/app.module';
import { GlobalDeserializerInterceptor } from './app/core/interceptors/global-deserializer.interceptor';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { AUTH_PREFIX } from '@pif/shared';

dayjs.extend(duration);

const PORT = 3000;

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
		bufferLogs: true
	});

	app.enableShutdownHooks();
	app.useLogger(app.get(Logger));

	await app.register(require('@fastify/helmet'));
	// Костыль для better auth, т.к. он строго привязан к express
	app.use((req: any, _: any, next: any) => {
		if (req.baseUrl === undefined) req.baseUrl = req.originalUrl || req.url || '';
		next();
	});

	const config = new DocumentBuilder().setTitle('ПИФ API').setVersion('0.1').build();
	const document = SwaggerModule.createDocument(app, config, {
		extraModels: [ApiErrorResponseDto]
	});

	const authDocument = await app.get(AuthService).api.generateOpenAPISchema({ path: AUTH_PREFIX });

	SwaggerModule.setup('openapi', app, document);
	SwaggerModule.setup('openapi/auth', app, authDocument as OpenAPIObject);

	app.useGlobalPipes(new ZodValidationPipe());
	app.useGlobalInterceptors(new GlobalDeserializerInterceptor());

	await app.listen(PORT);
	app.get(Logger).log(`Application is running on http://localhost:${PORT}`);
}

bootstrap().catch((err) => {
	console.error('Bootstrap failed:', err);
	process.exit(1);
});
