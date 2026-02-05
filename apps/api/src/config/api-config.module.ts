import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiConfigService } from './api-config.service';
import { envSchema } from './env.schema';

@Global()
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate: (config) => envSchema.parse(config),
			envFilePath: ['envs/.api.env', '.env.api', '.env'],
		}),
	],
	providers: [ApiConfigService],
	exports: [ApiConfigService],
})
export class ApiConfigModule {}
