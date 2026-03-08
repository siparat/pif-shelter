import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { LinkTelegramResult } from '@pif/contracts';
import { Logger } from 'nestjs-pino';
import { UsersRepository } from '../../../users/repositories/users.repository';
import { LinkTelegramByTokenHandler } from './link-telegram-by-token.handler';
import { LinkTelegramByTokenCommand } from './link-telegram-by-token.command';

describe('LinkTelegramByTokenHandler', () => {
	let handler: LinkTelegramByTokenHandler;
	let usersRepository: DeepMocked<UsersRepository>;

	const token = faker.string.uuid();
	const chatId = String(faker.number.int({ min: 1, max: 2e9 }));
	const telegramUsername = 'guardian_tg';
	const userId = faker.string.uuid();
	const user = {
		id: userId,
		name: 'Иван',
		email: 'guardian@example.com',
		telegram: '@guardian_tg',
		telegramBotLinkToken: token
	} as never;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LinkTelegramByTokenHandler,
				{ provide: UsersRepository, useValue: createMock<UsersRepository>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<LinkTelegramByTokenHandler>(LinkTelegramByTokenHandler);
		usersRepository = module.get(UsersRepository);
	});

	it('returns success and calls linkTelegramChat when user found and username matches', async () => {
		usersRepository.findByTelegramBotLinkToken.mockResolvedValue(user);
		usersRepository.linkTelegramChat.mockResolvedValue(undefined);

		const result = await handler.execute(new LinkTelegramByTokenCommand(token, chatId, telegramUsername));

		expect(result).toEqual({ result: LinkTelegramResult.SUCCESS });
		expect(usersRepository.findByTelegramBotLinkToken).toHaveBeenCalledWith(token);
		expect(usersRepository.linkTelegramChat).toHaveBeenCalledWith(userId, chatId);
	});

	it('returns success when user.telegram has @ and matches normalized username', async () => {
		usersRepository.findByTelegramBotLinkToken.mockResolvedValue(user);
		usersRepository.linkTelegramChat.mockResolvedValue(undefined);

		const result = await handler.execute(new LinkTelegramByTokenCommand(token, chatId, 'Guardian_TG'));

		expect(result).toEqual({ result: LinkTelegramResult.SUCCESS });
		expect(usersRepository.linkTelegramChat).toHaveBeenCalledWith(userId, chatId);
	});

	it('returns already_used when user not found by token', async () => {
		usersRepository.findByTelegramBotLinkToken.mockResolvedValue(undefined);

		const result = await handler.execute(new LinkTelegramByTokenCommand(token, chatId, telegramUsername));

		expect(result).toEqual({ result: LinkTelegramResult.ALREADY_USED });
		expect(usersRepository.linkTelegramChat).not.toHaveBeenCalled();
	});

	it('returns username_mismatch when telegram username does not match', async () => {
		usersRepository.findByTelegramBotLinkToken.mockResolvedValue(user);

		const result = await handler.execute(new LinkTelegramByTokenCommand(token, chatId, 'other_user'));

		expect(result).toEqual({ result: LinkTelegramResult.USERNAME_MISMATCH });
		expect(usersRepository.linkTelegramChat).not.toHaveBeenCalled();
	});
});
