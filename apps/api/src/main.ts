import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiErrorResponseDto } from '@pif/contracts';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app/app.module';
import { GlobalExceptionsFilter } from './app/core/filters/global-exceptions.filter';
import { ZodValidationExceptionFilter } from './app/core/filters/zod-exception.filter';
import { GlobalDeserializerInterceptor } from './app/core/interceptors/global-deserializer.interceptor';

const PORT = 3000;

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		credentials: true
	});

	const config = new DocumentBuilder().setTitle('ПИФ API').setVersion('0.1').build();
	const document = SwaggerModule.createDocument(app, config, {
		extraModels: [ApiErrorResponseDto]
	});
	SwaggerModule.setup('openapi', app, document);

	app.useGlobalPipes(new ZodValidationPipe());
	app.useGlobalInterceptors(new GlobalDeserializerInterceptor());
	app.useGlobalFilters(new GlobalExceptionsFilter(), new ZodValidationExceptionFilter());

	await app.listen(PORT);
	Logger.log(`Application is running on http://localhost:${PORT}`);
}

bootstrap();
