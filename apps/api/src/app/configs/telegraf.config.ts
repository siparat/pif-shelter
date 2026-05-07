import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@pif/config';
import { TelegrafModuleAsyncOptions } from 'nestjs-telegraf';
import { session } from 'telegraf';
import type { BotContext, IBotSession } from '../telegram-bot/telegram-bot.context';
const { HttpsProxyAgent } = require('https-proxy-agent');

export const getTelegrafConfig = (): TelegrafModuleAsyncOptions => ({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (config: ConfigService) => {
		const proxy = config.get('PROXY');

		console.log(proxy);

		return {
			token: config.getOrThrow('TELEGRAM_BOT_TOKEN'),
			launchOptions: false,
			options: { telegram: { agent: proxy ? new HttpsProxyAgent(proxy) : undefined } },
			middlewares: [
				session<IBotSession, BotContext>({
					defaultSession: (): IBotSession => ({})
				})
			]
		};
	}
});
