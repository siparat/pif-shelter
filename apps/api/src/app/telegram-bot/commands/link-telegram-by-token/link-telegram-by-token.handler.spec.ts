import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { LinkTelegramResult } from '@pif/contracts';
import { Logger } from 'nestjs-pino';
import { UsersService } from '../../../users/users.service';
import { LinkTelegramByTokenCommand } from './link-telegram-by-token.command';
import { LinkTelegramByTokenHandler } from './link-telegram-by-token.handler';

describe('LinkTelegramByTokenHandler', () => {
	let handler: LinkTelegramByTokenHandler;
	let usersService: DeepMocked<UsersService>;

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
				{ provide: UsersService, useValue: createMock<UsersService>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<LinkTelegramByTokenHandler>(LinkTelegramByTokenHandler);
		usersService = module.get(UsersService);
	});

	it('returns success and calls linkTelegramChat when user found and username matches', async () => {
		usersService.findByTelegramBotLinkToken.mockResolvedValue(user);
		usersService.linkTelegramChat.mockResolvedValue(undefined);

		const result = await handler.execute(new LinkTelegramByTokenCommand(token, chatId, telegramUsername));

		expect(result).toEqual({ result: LinkTelegramResult.SUCCESS });
		expect(usersService.findByTelegramBotLinkToken).toHaveBeenCalledWith(token);
		expect(usersService.linkTelegramChat).toHaveBeenCalledWith(userId, chatId);
	});

	it('returns success when user.telegram has @ and matches normalized username', async () => {
		usersService.findByTelegramBotLinkToken.mockResolvedValue(user);
		usersService.linkTelegramChat.mockResolvedValue(undefined);

		const result = await handler.execute(new LinkTelegramByTokenCommand(token, chatId, 'Guardian_TG'));

		expect(result).toEqual({ result: LinkTelegramResult.SUCCESS });
		expect(usersService.linkTelegramChat).toHaveBeenCalledWith(userId, chatId);
	});

	it('returns already_used when user not found by token', async () => {
		usersService.findByTelegramBotLinkToken.mockResolvedValue(undefined);

		const result = await handler.execute(new LinkTelegramByTokenCommand(token, chatId, telegramUsername));

		expect(result).toEqual({ result: LinkTelegramResult.ALREADY_USED });
		expect(usersService.linkTelegramChat).not.toHaveBeenCalled();
	});

	it('returns username_mismatch when telegram username does not match', async () => {
		usersService.findByTelegramBotLinkToken.mockResolvedValue(user);

		const result = await handler.execute(new LinkTelegramByTokenCommand(token, chatId, 'other_user'));

		expect(result).toEqual({ result: LinkTelegramResult.USERNAME_MISMATCH });
		expect(usersService.linkTelegramChat).not.toHaveBeenCalled();
	});
});
