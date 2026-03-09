import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@pif/config';
import { TelegrafModuleAsyncOptions } from 'nestjs-telegraf';
import { session } from 'telegraf';
import type { BotContext, IBotSession } from '../telegram-bot/telegram-bot.context';

export const getTelegrafConfig = (): TelegrafModuleAsyncOptions => ({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (config: ConfigService) => ({
		token: config.getOrThrow('TELEGRAM_BOT_TOKEN'),
		launchOptions: false,
		middlewares: [
			session<IBotSession, BotContext>({
				defaultSession: (): IBotSession => ({})
			})
		]
	})
});
