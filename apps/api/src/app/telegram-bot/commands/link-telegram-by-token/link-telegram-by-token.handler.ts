import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LinkTelegramResult } from '@pif/contracts';
import { normalizeTelegramUsername } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { LinkTelegramByTokenCommand } from './link-telegram-by-token.command';
import { UsersService } from '../../../users/users.service';

@CommandHandler(LinkTelegramByTokenCommand)
export class LinkTelegramByTokenHandler implements ICommandHandler<LinkTelegramByTokenCommand> {
	constructor(
		private readonly usersService: UsersService,
		private readonly logger: Logger
	) {}

	async execute({
		token,
		chatId,
		telegramUsername
	}: LinkTelegramByTokenCommand): Promise<{ result: LinkTelegramResult }> {
		const user = await this.usersService.findByTelegramBotLinkToken(token);
		if (!user) {
			this.logger.debug('Привязка Telegram по токену: токен не найден или уже использован', {
				tokenPrefix: token.slice(0, 8)
			});
			return { result: LinkTelegramResult.ALREADY_USED };
		}
		const normalized = normalizeTelegramUsername(telegramUsername);
		const userTelegramNormalized = normalizeTelegramUsername(user.telegram);
		if (normalized !== userTelegramNormalized) {
			this.logger.debug('Привязка Telegram по токену: несовпадение username', {
				expected: user.telegram,
				received: telegramUsername
			});
			return { result: LinkTelegramResult.USERNAME_MISMATCH };
		}
		await this.usersService.linkTelegramChat(user.id, chatId);
		this.logger.log('Telegram привязан по токену', { userId: user.id });
		return { result: LinkTelegramResult.SUCCESS };
	}
}
