import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiErrorResponseDto } from '@pif/contracts';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app/app.module';
import { GlobalExceptionsFilter } from './app/core/filters/global-exceptions.filter';
import { ZodValidationExceptionFilter } from './app/core/filters/zod-exception.filter';
import { GlobalDeserializerInterceptor } from './app/core/interceptors/global-deserializer.interceptor';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	const globalPrefix = 'api';
	app.setGlobalPrefix(globalPrefix);

	const config = new DocumentBuilder().setTitle('ПИФ API').setVersion('0.1').build();
	const document = SwaggerModule.createDocument(app, config, {
		extraModels: [ApiErrorResponseDto]
	});
	SwaggerModule.setup(globalPrefix + '/openapi', app, document);

	app.useGlobalPipes(new ZodValidationPipe());
	app.useGlobalInterceptors(new GlobalDeserializerInterceptor());
	app.useGlobalFilters(new GlobalExceptionsFilter(), new ZodValidationExceptionFilter());

	const port = 3000;
	await app.listen(port);
	Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
