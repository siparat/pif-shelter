import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { donationSubscriptionCancelLinkEmail } from '@pif/email-templates';
import { render } from '@react-email/render';
import { Logger } from 'nestjs-pino';
import { DonationIntentsRepository } from '../../repositories/donation-intents.repository';
import { DonationSubscriptionInitiatedEvent } from './donation-subscription-initiated.event';
import { SendDonationSubscriptionCancelLinkEmailHandler } from './send-donation-subscription-cancel-link-email.handler';

jest.mock('@react-email/render', () => ({
	render: jest.fn().mockResolvedValue('<html>ok</html>')
}));

describe('SendDonationSubscriptionCancelLinkEmailHandler', () => {
	let handler: SendDonationSubscriptionCancelLinkEmailHandler;
	let repository: DeepMocked<DonationIntentsRepository>;
	let mailerService: DeepMocked<MailerService>;
	let config: DeepMocked<ConfigService>;
	let logger: DeepMocked<Logger>;

	const email = 'user@example.com';
	const subscription = {
		id: faker.string.uuid(),
		subscriptionId: faker.string.uuid(),
		displayName: 'Test',
		hidePublicName: false,
		amountPerPeriod: 100,
		status: 'ACTIVE',
		cancelledAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		cancellationToken: null
	} as any;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SendDonationSubscriptionCancelLinkEmailHandler,
				{ provide: DonationIntentsRepository, useValue: createMock<DonationIntentsRepository>() },
				{ provide: MailerService, useValue: createMock<MailerService>() },
				{ provide: ConfigService, useValue: createMock<ConfigService>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<SendDonationSubscriptionCancelLinkEmailHandler>(
			SendDonationSubscriptionCancelLinkEmailHandler
		);
		repository = module.get(DonationIntentsRepository);
		mailerService = module.get(MailerService);
		config = module.get(ConfigService);
		logger = module.get(Logger);

		config.getOrThrow.mockImplementation((key: string) =>
			key === 'APP_BASE_URL' ? 'https://app.example.com' : ''
		);
	});

	it('generates cancellation token, stores it and sends cancel link email', async () => {
		repository.findSubscriptionBySubscriptionId.mockResolvedValue(subscription);
		repository.setSubscriptionCancellationToken.mockResolvedValue(subscription);

		await handler.handle(new DonationSubscriptionInitiatedEvent(subscription, email));

		expect(repository.setSubscriptionCancellationToken).toHaveBeenCalledWith(subscription.id, expect.any(String));
		expect(mailerService.sendMail).toHaveBeenCalledWith({
			to: email,
			subject: donationSubscriptionCancelLinkEmail.subject,
			html: '<html>ok</html>'
		});
		expect(render).toHaveBeenCalled();
		expect(logger.log).toHaveBeenCalledWith('Ссылка для отмены донат-подписки отправлена', {
			subscriptionId: subscription.subscriptionId,
			email
		});
	});
});
