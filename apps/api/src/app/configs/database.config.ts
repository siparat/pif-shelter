import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@pif/config';
import { IDatabaseModuleAsyncOptions } from '@pif/database';

export const getDatabaseConfig = (): IDatabaseModuleAsyncOptions => ({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (config: ConfigService) => ({ url: config.getOrThrow('DATABASE_URL') })
});
