import { Global, Module } from '@nestjs/common';
import { ConfigModule as CoreConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';

@Global()
@Module({
	imports: [
		CoreConfigModule.forRoot({
			isGlobal: true,
			validate: (config) => envSchema.parse(config),
			envFilePath: ['envs/.api.env', '.api.env', '.env']
		})
	]
})
export class ConfigModule {}
