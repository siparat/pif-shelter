import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@pif/config';

export const getMailerConfig = (): MailerAsyncOptions => ({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (config: ConfigService) => {
		const email = config.getOrThrow<string>('SMTP_EMAIL');

		return {
			defaults: {
				from: `"Приют ПИФ" <${email}>`
			},
			transport: {
				host: config.getOrThrow('SMTP_HOST'),
				port: config.getOrThrow('SMTP_PORT'),
				secure: true,
				auth: {
					user: email,
					pass: config.getOrThrow('SMTP_PASSWORD')
				}
			}
		};
	}
});
