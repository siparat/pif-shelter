import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Logger } from 'nestjs-pino';
import { AppAuth } from '../../../../configs/auth.config';
import { UsersService } from '../../../../users/users.service';
import { InvitationAcceptedEvent } from '../../events/invitation-accepted/invitation-accepted.event';
import { AdminUsersRepository } from '../../repositories/admin-users.repository';
import { AcceptInvitationCommand } from './accept-invitation.command';
import { AcceptInvitationPolicy } from './accept-invitation.policy';

@CommandHandler(AcceptInvitationCommand)
export class AcceptInvitationHandler implements ICommandHandler<AcceptInvitationCommand> {
	constructor(
		private readonly repository: AdminUsersRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger,
		private readonly authService: AuthService<AppAuth>,
		private readonly policy: AcceptInvitationPolicy,
		private readonly usersService: UsersService
	) {}

	async execute(command: AcceptInvitationCommand): Promise<{ userId: string }> {
		const { dto } = command;

		const invitation = await this.repository.findInvitationByToken(dto.token);

		const validInvitation = await this.policy.assertAccept(invitation, dto);

		let createdUserId: string | null = null;

		try {
			const result = await this.authService.api.signUpEmail({
				returnStatus: true,
				body: {
					password: dto.password,
					email: validInvitation.email,
					name: dto.fullName,
					image: dto.avatarKey,
					position: validInvitation.roleName,
					telegram: dto.telegram
				}
			});
			createdUserId = result.response.user.id;

			await this.repository.markInvitationAsUsed(validInvitation.id, createdUserId);

			this.eventBus.publish(new InvitationAcceptedEvent(validInvitation, dto, createdUserId));

			this.logger.log('Приглашение принято, пользователь зарегистирован', { invitationId: validInvitation.id });

			return { userId: createdUserId };
		} catch (error) {
			if (createdUserId) {
				this.logger.warn('Откат создания пользователя из-за ошибки обработки приглашения', {
					userId: createdUserId,
					invitationId: validInvitation.id
				});
				await this.usersService.delete(createdUserId);
			}

			this.logger.error('Ошибка при создании пользователя', { error, dto, invitationId: validInvitation.id });
			throw error;
		}
	}
}
