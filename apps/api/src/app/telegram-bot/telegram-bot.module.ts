import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TelegrafModule } from 'nestjs-telegraf';
import { getTelegrafConfig } from '../configs/telegraf.config';
import { UsersModule } from '../users/users.module';
import { LinkTelegramByTokenHandler } from './commands/link-telegram-by-token/link-telegram-by-token.handler';
import { TelegramBotUpdate } from './telegram-bot.update';

@Module({
	imports: [CqrsModule, UsersModule, TelegrafModule.forRootAsync(getTelegrafConfig())],
	providers: [TelegramBotUpdate, LinkTelegramByTokenHandler]
})
export class TelegramBotModule {}
