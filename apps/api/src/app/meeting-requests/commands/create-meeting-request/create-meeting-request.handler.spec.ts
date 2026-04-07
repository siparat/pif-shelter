import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { CreateMeetingRequestDto } from '@pif/contracts';
import { meetingRequests } from '@pif/database';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { MeetingRequestAnimalNotFoundException } from '../../exceptions/meeting-request-animal-not-found.exception';
import { MeetingRequestCuratorNotAssignedException } from '../../exceptions/meeting-request-curator-not-assigned.exception';
import { MeetingRequestsRepository } from '../../repositories/meeting-requests.repository';
import { CreateMeetingRequestCommand } from './create-meeting-request.command';
import { CreateMeetingRequestHandler } from './create-meeting-request.handler';

describe('CreateMeetingRequestHandler', () => {
	let handler: CreateMeetingRequestHandler;
	let repository: DeepMocked<MeetingRequestsRepository>;
	let eventBus: DeepMocked<EventBus>;

	const dto: CreateMeetingRequestDto = {
		animalId: randomUUID(),
		name: 'Иван',
		phone: '+79990000000',
		email: 'ivan@example.com',
		meetingAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
		comment: 'Хочу познакомиться'
	};

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				CreateMeetingRequestHandler,
				{ provide: MeetingRequestsRepository, useValue: createMock<MeetingRequestsRepository>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(CreateMeetingRequestHandler);
		repository = module.get(MeetingRequestsRepository);
		eventBus = module.get(EventBus);
	});

	it('throws when animal not found', async () => {
		repository.findAnimalWithCurator.mockResolvedValue(undefined);
		await expect(handler.execute(new CreateMeetingRequestCommand(dto))).rejects.toThrow(
			MeetingRequestAnimalNotFoundException
		);
		expect(repository.create).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('throws when animal has no curator', async () => {
		repository.findAnimalWithCurator.mockResolvedValue({ id: dto.animalId, curatorId: null });
		await expect(handler.execute(new CreateMeetingRequestCommand(dto))).rejects.toThrow(
			MeetingRequestCuratorNotAssignedException
		);
		expect(repository.create).not.toHaveBeenCalled();
	});

	it('creates meeting request and returns id', async () => {
		const id = randomUUID();
		repository.findAnimalWithCurator.mockResolvedValue({ id: dto.animalId, curatorId: 'curator-1' });
		repository.create.mockResolvedValue({ id } as typeof meetingRequests.$inferSelect);

		const result = await handler.execute(new CreateMeetingRequestCommand(dto));

		expect(result).toEqual({ id });
		expect(repository.create).toHaveBeenCalledWith(
			expect.objectContaining({
				animalId: dto.animalId,
				curatorUserId: 'curator-1',
				name: dto.name,
				phone: dto.phone
			})
		);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
	});
});
