import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@pif/config';
import { IStorageOptions } from '@pif/storage';

export const getStorageConfig = (): IStorageOptions => ({
	adapter: 'S3',
	options: {
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: (config: ConfigService) => ({
			accessKey: config.getOrThrow('S3_ACCESS_TOKEN'),
			secretAccessKey: config.getOrThrow('S3_ACCESS_SECRET_TOKEN'),
			baseUrl: config.getOrThrow('S3_ENDPOINT'),
			bucket: config.getOrThrow('S3_BUCKET'),
			region: config.getOrThrow('S3_REGION')
		})
	}
});
