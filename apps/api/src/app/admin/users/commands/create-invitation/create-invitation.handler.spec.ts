import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { UsersService } from '../../../../users/users.service';
import { InvitationCreatedEvent } from '../../events/invitation-created/invitation-created.event';
import { UserAlreadyExistsException } from '../../exceptions/user-already-exists.exception';
import { AdminUsersRepository } from '../../repositories/admin-users.repository';
import { CreateInvitationCommand } from './create-invitation.command';
import { CreateInvitationHandler } from './create-invitation.handler';

describe('CreateInvitationHandler', () => {
	let handler: CreateInvitationHandler;
	let repository: DeepMocked<AdminUsersRepository>;
	let usersService: DeepMocked<UsersService>;
	let eventBus: DeepMocked<EventBus>;

	const dto = {
		email: 'new-volunteer@pif.xyz',
		name: 'John Doe',
		roleName: 'Volunteer'
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CreateInvitationHandler,
				{ provide: AdminUsersRepository, useValue: createMock<AdminUsersRepository>() },
				{ provide: UsersService, useValue: createMock<UsersService>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<CreateInvitationHandler>(CreateInvitationHandler);
		repository = module.get(AdminUsersRepository);
		usersService = module.get(UsersService);
		eventBus = module.get(EventBus);
	});

	it('creates invitation and publishes InvitationCreatedEvent when user does not exist', async () => {
		const invitationId = faker.string.uuid();
		const invitation = {
			id: invitationId,
			email: dto.email,
			personName: dto.name,
			roleName: dto.roleName,
			used: false,
			expiresAt: new Date(),
			deletedAt: null
		} as never;

		usersService.findByEmail.mockResolvedValue(undefined);
		repository.createInvitation.mockResolvedValue(invitation);

		const command = new CreateInvitationCommand(dto);
		const result = await handler.execute(command);

		expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
		expect(repository.createInvitation).toHaveBeenCalledWith(dto, expect.any(Date));
		expect(eventBus.publish).toHaveBeenCalledWith(expect.any(InvitationCreatedEvent));
		expect((eventBus.publish as jest.Mock).mock.calls[0][0].invitation).toEqual(invitation);
		expect(result).toEqual({ invitationId });
	});

	it('throws UserAlreadyExistsException when user already exists', async () => {
		usersService.findByEmail.mockResolvedValue({ id: faker.string.uuid(), email: dto.email } as never);

		const command = new CreateInvitationCommand(dto);

		await expect(handler.execute(command)).rejects.toThrow(UserAlreadyExistsException);
		expect(repository.createInvitation).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('rethrows when repository throws', async () => {
		usersService.findByEmail.mockResolvedValue(undefined);
		repository.createInvitation.mockRejectedValue(new Error('DB error'));

		const command = new CreateInvitationCommand(dto);

		await expect(handler.execute(command)).rejects.toThrow('DB error');
		expect(eventBus.publish).not.toHaveBeenCalled();
	});
});
