import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { StartGuardianshipRequestDto } from '@pif/contracts';
import { Logger } from 'nestjs-pino';
import { AppAuth } from '../../../configs/auth.config';
import { UsersService } from '../../../users/users.service';
import { AnimalAlreadyHasGuardianException } from '../../exceptions/animal-already-has-guardian.exception';
import { GuardianRequiresAuthException } from '../../exceptions/guardian-requires-auth.exception';
import { StartGuardianshipCommand } from '../start-guardianship/start-guardianship.command';
import { StartGuardianshipAsGuestCommand } from './start-guardianship-as-guest.command';
import { StartGuardianshipAsGuestHandler } from './start-guardianship-as-guest.handler';

jest.mock('@thallesp/nestjs-better-auth', () => ({
	AuthService: class MockAuthService {
		api = { signUpEmail: jest.fn() };
	}
}));

import { AuthService } from '@thallesp/nestjs-better-auth';

const createMockAuthService = () => ({ api: { signUpEmail: jest.fn() } });

describe('StartGuardianshipAsGuestHandler', () => {
	let handler: StartGuardianshipAsGuestHandler;
	let usersService: DeepMocked<UsersService>;
	let authService: ReturnType<typeof createMockAuthService>;
	let commandBus: DeepMocked<CommandBus>;
	let eventBus: DeepMocked<EventBus>;

	const animalId = faker.string.uuid();
	const dto: StartGuardianshipRequestDto = {
		animalId,
		name: faker.person.firstName(),
		email: faker.internet.email(),
		telegramUsername: '@validuser'
	};

	beforeEach(async () => {
		const mockAuth = createMockAuthService();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				StartGuardianshipAsGuestHandler,
				{ provide: UsersService, useValue: createMock<UsersService>() },
				{ provide: AuthService, useValue: mockAuth as never },
				{ provide: CommandBus, useValue: createMock<CommandBus>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<StartGuardianshipAsGuestHandler>(StartGuardianshipAsGuestHandler);
		usersService = module.get(UsersService);
		authService = module.get(AuthService);
		commandBus = module.get(CommandBus);
		eventBus = module.get(EventBus);
	});

	it('throws GuardianRequiresAuthException when user exists by email', async () => {
		usersService.findByEmail.mockResolvedValue({ id: faker.string.uuid() } as never);
		usersService.findByTelegram.mockResolvedValue(undefined as never);

		await expect(handler.execute(new StartGuardianshipAsGuestCommand(dto))).rejects.toThrow(
			GuardianRequiresAuthException
		);
		expect(authService.api.signUpEmail).not.toHaveBeenCalled();
		expect(commandBus.execute).not.toHaveBeenCalled();
	});

	it('throws GuardianRequiresAuthException when user exists by telegram', async () => {
		usersService.findByEmail.mockResolvedValue(undefined as never);
		usersService.findByTelegram.mockResolvedValue({ id: faker.string.uuid() } as never);

		await expect(handler.execute(new StartGuardianshipAsGuestCommand(dto))).rejects.toThrow(
			GuardianRequiresAuthException
		);
		expect(authService.api.signUpEmail).not.toHaveBeenCalled();
	});

	it('returns guardianshipId and paymentUrl and publishes GuardianRegisteredEvent when signup and StartGuardianship succeed', async () => {
		const userId = faker.string.uuid();
		const guardianshipId = faker.string.uuid();
		const paymentUrl = 'https://pay.example/link';
		const createdUser = { id: userId, email: dto.email, name: dto.name } as AppAuth['$Infer']['Session']['user'];

		usersService.findByEmail.mockResolvedValue(undefined as never);
		usersService.findByTelegram.mockResolvedValue(undefined as never);
		authService.api.signUpEmail.mockResolvedValue({
			response: { user: createdUser }
		} as never);
		commandBus.execute.mockResolvedValue({ guardianshipId, paymentUrl });

		const result = await handler.execute(new StartGuardianshipAsGuestCommand(dto));

		expect(result).toEqual({ guardianshipId, paymentUrl });
		expect(commandBus.execute).toHaveBeenCalledWith(new StartGuardianshipCommand(userId, animalId));
		expect(eventBus.publish).toHaveBeenCalledWith(
			expect.objectContaining({
				user: createdUser,
				password: expect.any(String)
			})
		);
		expect(usersService.delete).not.toHaveBeenCalled();
	});

	it('deletes created user and rethrows when StartGuardianshipCommand throws', async () => {
		const userId = faker.string.uuid();
		const createdUser = { id: userId } as AppAuth['$Infer']['Session']['user'];

		usersService.findByEmail.mockResolvedValue(undefined as never);
		usersService.findByTelegram.mockResolvedValue(undefined as never);
		authService.api.signUpEmail.mockResolvedValue({
			response: { user: createdUser }
		} as never);
		commandBus.execute.mockRejectedValue(new AnimalAlreadyHasGuardianException());
		usersService.delete.mockResolvedValue(undefined);

		await expect(handler.execute(new StartGuardianshipAsGuestCommand(dto))).rejects.toThrow(
			AnimalAlreadyHasGuardianException
		);
		expect(usersService.delete).toHaveBeenCalledWith(userId);
		expect(eventBus.publish).not.toHaveBeenCalled();
	});
});
