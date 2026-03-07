import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '@pif/database';
import { GuardianshipStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { UsersService } from '../../../users/users.service';
import { GuardianshipActivatedEvent } from './guardianship-activated.event';
import { SendGuardianshipActivatedEmailHandler } from './send-guardianship-activated-email.handler';

jest.mock('@react-email/render', () => ({
	render: jest.fn().mockResolvedValue('<html>ok</html>')
}));

describe('SendGuardianshipActivatedEmailHandler', () => {
	let handler: SendGuardianshipActivatedEmailHandler;
	let db: DeepMocked<DatabaseService>;
	let mailerService: DeepMocked<MailerService>;
	let config: DeepMocked<ConfigService>;
	let logger: DeepMocked<Logger>;

	const guardianshipId = faker.string.uuid();
	const eventGuardianship = {
		id: guardianshipId,
		animalId: faker.string.uuid(),
		guardianUserId: faker.string.uuid(),
		subscriptionId: faker.string.uuid(),
		status: GuardianshipStatusEnum.ACTIVE,
		startedAt: new Date(),
		cancelledAt: null,
		cancellationToken: faker.string.uuid()
	};
	const baseResult = {
		...eventGuardianship,
		guardian: {
			id: faker.string.uuid(),
			name: 'Иван',
			email: 'guardian@example.com',
			telegramBotLinkToken: null as string | null
		},
		animal: {
			id: faker.string.uuid(),
			name: 'Барсик'
		}
	};

	beforeEach(async () => {
		const mockFindFirst = jest.fn();
		db = createMock<DatabaseService>({
			client: {
				query: {
					guardianships: {
						findFirst: mockFindFirst
					}
				}
			}
		}) as DeepMocked<DatabaseService>;

		config = createMock<ConfigService>();
		config.getOrThrow.mockImplementation((key: string) => (key === 'TELEGRAM_BOT_USERNAME' ? 'pif_bot' : ''));

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SendGuardianshipActivatedEmailHandler,
				{ provide: DatabaseService, useValue: db },
				{ provide: MailerService, useValue: createMock<MailerService>() },
				{ provide: ConfigService, useValue: config },
				{
					provide: UsersService,
					useValue: createMock<UsersService>({
						setTelegramBotLinkToken: jest.fn().mockResolvedValue(undefined)
					})
				},
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<SendGuardianshipActivatedEmailHandler>(SendGuardianshipActivatedEmailHandler);
		mailerService = module.get(MailerService);
		logger = module.get(Logger);
	});

	it('skips and logs debug when guardian has no email', async () => {
		const result = { ...baseResult, guardian: { ...baseResult.guardian, email: null } };
		(db.client.query.guardianships.findFirst as jest.Mock).mockResolvedValue(result);

		await handler.handle(new GuardianshipActivatedEvent(eventGuardianship as never));

		expect(logger.debug).toHaveBeenCalledWith(
			'Пропуск отправки письма «вы оформили опекунство»: нет email или имени животного',
			{ guardianshipId }
		);
		expect(mailerService.sendMail).not.toHaveBeenCalled();
	});

	it('sends mail and logs success when all data present', async () => {
		(db.client.query.guardianships.findFirst as jest.Mock).mockResolvedValue(baseResult);
		mailerService.sendMail.mockResolvedValue(undefined);

		await handler.handle(new GuardianshipActivatedEvent(eventGuardianship as never));

		expect(config.getOrThrow).toHaveBeenCalledWith('TELEGRAM_BOT_USERNAME');
		expect(mailerService.sendMail).toHaveBeenCalledWith({
			to: baseResult.guardian.email,
			subject: expect.any(String),
			html: '<html>ok</html>'
		});
		expect(logger.log).toHaveBeenCalledWith('Письмо «вы оформили опекунство» отправлено', {
			guardianshipId,
			email: baseResult.guardian.email
		});
	});

	it('logs error and does not rethrow when sendMail throws', async () => {
		(db.client.query.guardianships.findFirst as jest.Mock).mockResolvedValue(baseResult);
		mailerService.sendMail.mockRejectedValue(new Error('SMTP failed'));

		await handler.handle(new GuardianshipActivatedEvent(eventGuardianship as never));

		expect(logger.error).toHaveBeenCalledWith('Ошибка при отправке письма «вы оформили опекунство»', {
			err: 'SMTP failed',
			guardianshipId,
			email: baseResult.guardian.email
		});
	});
});
