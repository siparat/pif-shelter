import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@pif/config';
import { TelegrafModuleAsyncOptions } from 'nestjs-telegraf';

export const getTelegrafConfig = (): TelegrafModuleAsyncOptions => ({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (config: ConfigService) => ({
		token: config.getOrThrow('TELEGRAM_BOT_TOKEN'),
		launchOptions: { dropPendingUpdates: true }
	})
});
