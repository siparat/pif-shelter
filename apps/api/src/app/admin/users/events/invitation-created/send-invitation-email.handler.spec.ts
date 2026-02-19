import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Invitation } from '@pif/database';
import { Logger } from 'nestjs-pino';
import { SendInvitationEmailHandler } from './send-invitation-email.handler';
import { InvitationCreatedEvent } from './invitation-created.event';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

jest.mock('@react-email/render', () => ({
	render: jest.fn().mockResolvedValue('<html><body>Mock Email</body></html>')
}));

describe('SendInvitationEmailHandler', () => {
	let handler: SendInvitationEmailHandler;
	let mailerService: DeepMocked<MailerService>;
	let configService: DeepMocked<ConfigService>;
	let logger: DeepMocked<Logger>;

	const mockInvitation = {
		id: 'inv-123',
		email: 'volunteer@pif.xyz',
		personName: 'Alex',
		roleName: 'Photographer',
		token: 'secret-token-123'
	} as Invitation;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SendInvitationEmailHandler,
				{
					provide: MailerService,
					useValue: createMock<MailerService>()
				},
				{
					provide: ConfigService,
					useValue: createMock<ConfigService>()
				},
				{
					provide: Logger,
					useValue: createMock<Logger>()
				}
			]
		}).compile();

		handler = module.get<SendInvitationEmailHandler>(SendInvitationEmailHandler);
		mailerService = module.get(MailerService);
		configService = module.get(ConfigService);
		logger = module.get(Logger);
	});

	it('should format the invite link correctly and call MailerService', async () => {
		const baseUrl = 'https://pif.xyz';
		configService.getOrThrow.mockReturnValue(baseUrl);

		await handler.handle(new InvitationCreatedEvent(mockInvitation));

		expect(configService.getOrThrow).toHaveBeenCalledWith('APP_BASE_URL');
		expect(mailerService.sendMail).toHaveBeenCalledWith({
			to: mockInvitation.email,
			subject: expect.any(String),
			html: '<html><body>Mock Email</body></html>'
		});
	});

	it('should log an error if mail sending fails', async () => {
		configService.getOrThrow.mockReturnValue('https://pif.xyz');
		mailerService.sendMail.mockRejectedValue(new Error('SMTP connection failed'));

		await handler.handle(new InvitationCreatedEvent(mockInvitation));

		expect(logger.error).toHaveBeenCalledWith(
			expect.objectContaining({
				email: mockInvitation.email,
				invitationId: mockInvitation.id
			}),
			'Ошибка при отправке письма с приглашением'
		);
	});
});
