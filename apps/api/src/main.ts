import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app/app.module';
import { GlobalExceptionsFilter } from './app/core/filters/global-exceptions.filter';
import { ZodValidationExceptionFilter } from './app/core/filters/zod-exception.filter';
import { GlobalDeserializerInterceptor } from './app/core/interceptors/global-deserializer.interceptor';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	const globalPrefix = 'api';
	app.setGlobalPrefix(globalPrefix);

	app.useGlobalPipes(new ZodValidationPipe());
	app.useGlobalInterceptors(new GlobalDeserializerInterceptor());
	app.useGlobalFilters(new GlobalExceptionsFilter(), new ZodValidationExceptionFilter());

	const port = 3000;
	await app.listen(port);
	Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
