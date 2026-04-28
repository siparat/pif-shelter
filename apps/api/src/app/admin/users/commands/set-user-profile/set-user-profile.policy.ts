import { Injectable } from '@nestjs/common';
import { users } from '@pif/database';
import { UsersService } from '../../../../users/users.service';
import { TelegramAlreadyUsedException } from '../../exceptions/telegram-already-used.exception';
import { UserAlreadyExistsException } from '../../exceptions/user-already-exists.exception';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';

@Injectable()
export class SetUserProfilePolicy {
	constructor(private readonly usersService: UsersService) {}

	async assertCanSet(userId: string, email: string, telegram: string): Promise<typeof users.$inferSelect> {
		const user = await this.usersService.findById(userId);
		if (!user) {
			throw new UserNotFoundException(userId);
		}

		const normalizedEmail = email.trim().toLowerCase();
		if (user.email !== normalizedEmail) {
			const userByEmail = await this.usersService.findByEmail(normalizedEmail);
			if (userByEmail && userByEmail.id !== userId) {
				throw new UserAlreadyExistsException();
			}
		}

		if (user.telegram !== telegram) {
			const userByTelegram = await this.usersService.findByTelegram(telegram);
			if (userByTelegram && userByTelegram.id !== userId) {
				throw new TelegramAlreadyUsedException(telegram);
			}
		}

		return user;
	}
}
