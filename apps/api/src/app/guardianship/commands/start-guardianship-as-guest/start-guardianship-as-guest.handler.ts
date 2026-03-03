import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { GUARDIAN_DEFAULT_POSITION, UserRole } from '@pif/shared';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { randomBytes } from 'crypto';
import { Logger } from 'nestjs-pino';
import { AppAuth } from '../../../configs/auth.config';
import { UsersService } from '../../../users/users.service';
import { GuardianRegisteredEvent } from '../../events/guardian-registered/guardian-registered.event';
import { GuardianRequiresAuthException } from '../../exceptions/guardian-requires-auth.exception';
import { StartGuardianshipCommand } from '../start-guardianship/start-guardianship.command';
import { StartGuardianshipAsGuestCommand } from './start-guardianship-as-guest.command';

@CommandHandler(StartGuardianshipAsGuestCommand)
export class StartGuardianshipAsGuestHandler implements ICommandHandler<StartGuardianshipAsGuestCommand> {
	constructor(
		private readonly usersService: UsersService,
		private readonly authService: AuthService<AppAuth>,
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute(command: StartGuardianshipAsGuestCommand): Promise<{ guardianshipId: string; paymentUrl: string }> {
		const { dto } = command;

		const [existingByEmail, existingByTelegram] = await Promise.all([
			this.usersService.findByEmail(dto.email),
			this.usersService.findByTelegram(dto.telegramUsername)
		]);

		if (existingByEmail || existingByTelegram) {
			throw new GuardianRequiresAuthException();
		}

		const password = randomBytes(24).toString('base64');

		let createdUser: AppAuth['$Infer']['Session']['user'] | null = null;

		try {
			const result = await this.authService.api.signUpEmail({
				returnStatus: true,
				body: {
					email: dto.email,
					name: dto.name,
					password,
					telegram: dto.telegramUsername,
					role: UserRole.GUARDIAN,
					position: GUARDIAN_DEFAULT_POSITION
				}
			});

			createdUser = result.response.user;

			const { guardianshipId, paymentUrl } = await this.commandBus.execute(
				new StartGuardianshipCommand(createdUser.id, dto.animalId)
			);

			this.logger.log('Опекунство оформлено для нового пользователя', {
				guardianshipId,
				userId: createdUser.id,
				animalId: dto.animalId
			});

			this.eventBus.publish(new GuardianRegisteredEvent(createdUser, password));

			return { guardianshipId, paymentUrl };
		} catch (error) {
			if (createdUser) {
				this.logger.warn('Откат создания пользователя из-за ошибки оформления опекунства', {
					userId: createdUser,
					animalId: dto.animalId
				});
				await this.usersService.delete(createdUser.id);
			}
			throw error;
		}
	}
}
