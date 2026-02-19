import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import dayjs from 'dayjs';
import { Logger } from 'nestjs-pino';
import { UsersService } from '../../../../users/users.service';
import { InvitationCreatedEvent } from '../../events/invitation-created/invitation-created.event';
import { UserAlreadyExistsException } from '../../exceptions/user-already-exists.exception';
import { AdminUsersRepository } from '../../repositories/admin-users.repository';
import { CreateInvitationCommand } from './create-invitation.command';

@CommandHandler(CreateInvitationCommand)
export class CreateInvitationHandler implements ICommandHandler<CreateInvitationCommand> {
	constructor(
		private readonly repository: AdminUsersRepository,
		private readonly usersService: UsersService,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute(command: CreateInvitationCommand): Promise<{ invitationId: string }> {
		const { dto } = command;

		const user = await this.usersService.findByEmail(dto.email);
		if (user) {
			throw new UserAlreadyExistsException();
		}

		try {
			const expiresAt = dayjs().add(1, 'day').toDate();
			const invitation = await this.repository.createInvitation(dto, expiresAt);

			this.eventBus.publish(new InvitationCreatedEvent(invitation));

			this.logger.log({ email: dto.email, invitationId: invitation.id }, 'Приглашение успешно создано');

			return { invitationId: invitation.id };
		} catch (error) {
			this.logger.error({ error, email: dto.email }, 'Ошибка базы данных при создании приглашения');
			throw error;
		}
	}
}
