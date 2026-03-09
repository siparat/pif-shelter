import { DynamicModule, Module, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InjectBot, TelegrafModule, TelegrafModuleAsyncOptions } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { UsersModule } from '../users/users.module';
import { LinkTelegramByTokenHandler } from './commands/link-telegram-by-token/link-telegram-by-token.handler';
import { BotHelpConfigRepository } from './repositories/bot-help-config.repository';
import { DrizzleBotHelpConfigRepository } from './repositories/drizzle-bot-help-config.repository';
import { TelegramBotUpdate } from './telegram-bot.update';

@Module({})
export class TelegramBotModule implements OnModuleInit, OnApplicationShutdown {
	constructor(@InjectBot() private readonly telegraf: Telegraf) {}

	async onModuleInit(): Promise<void> {
		this.telegraf.launch({ dropPendingUpdates: true });
	}

	async onApplicationShutdown(): Promise<void> {
		this.telegraf.stop();
	}

	static forRootAsync(options: TelegrafModuleAsyncOptions): DynamicModule {
		return {
			module: TelegramBotModule,
			imports: [CqrsModule, UsersModule, TelegrafModule.forRootAsync(options)],
			providers: [
				TelegramBotUpdate,
				LinkTelegramByTokenHandler,
				{
					provide: BotHelpConfigRepository,
					useClass: DrizzleBotHelpConfigRepository
				}
			]
		};
	}
}
