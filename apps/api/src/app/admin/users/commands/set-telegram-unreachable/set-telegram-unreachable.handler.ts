import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { UsersService } from '../../../../users/users.service';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { SetTelegramUnreachableCommand } from './set-telegram-unreachable.command';

@CommandHandler(SetTelegramUnreachableCommand)
export class SetTelegramUnreachableHandler implements ICommandHandler<SetTelegramUnreachableCommand> {
	constructor(
		private readonly usersService: UsersService,
		private readonly logger: Logger
	) {}

	async execute(command: SetTelegramUnreachableCommand): Promise<{ userId: string; telegramUnreachable: boolean }> {
		const { userId, unreachable: isSetUnreachable } = command;
		const user = await this.usersService.findById(userId);
		if (!user) {
			throw new UserNotFoundException(userId);
		}
		if (user.telegramUnreachable === isSetUnreachable) {
			return { userId, telegramUnreachable: isSetUnreachable };
		}
		await this.usersService.setTelegramUnreachable(userId, isSetUnreachable);
		this.logger.log('telegram_unreachable обновлён', { userId, telegramUnreachable: isSetUnreachable });
		return { userId, telegramUnreachable: isSetUnreachable };
	}
}
