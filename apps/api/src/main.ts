import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { ApiErrorResponseDto } from '@pif/contracts';
import { AuthService } from '@thallesp/nestjs-better-auth';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app/app.module';
import { GlobalDeserializerInterceptor } from './app/core/interceptors/global-deserializer.interceptor';

const PORT = 3000;

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule, { bufferLogs: true, bodyParser: false });

	app.enableShutdownHooks();
	app.useLogger(app.get(Logger));

	app.use(helmet());

	app.enableCors({
		origin: app.get(ConfigService).getOrThrow<string>('ALLOWED_ORIGINS').split(','),
		credentials: true
	});

	const config = new DocumentBuilder().setTitle('ПИФ API').setVersion('0.1').build();
	const document = SwaggerModule.createDocument(app, config, {
		extraModels: [ApiErrorResponseDto]
	});

	const authDocument = await app.get(AuthService).api.generateOpenAPISchema({ path: '/auth' });

	SwaggerModule.setup('openapi', app, document);
	SwaggerModule.setup('openapi/auth', app, authDocument as OpenAPIObject);

	app.useGlobalPipes(new ZodValidationPipe());
	app.useGlobalInterceptors(new GlobalDeserializerInterceptor());

	await app.listen(PORT);
	app.get(Logger).log(`Application is running on http://localhost:${PORT}`);
}

bootstrap();
