import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ForbiddenException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { CacheService } from '@pif/cache';
import { CreateMeetingRequestDto } from '@pif/contracts';
import { meetingRequests } from '@pif/database';
import {
	BlacklistContext,
	BlacklistSource,
	MEETING_FORM_AUTOMATIC_SUSPICION_REASON,
	MeetingCacheKeys,
	generateIdempotencyKey
} from '@pif/shared';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Logger } from 'nestjs-pino';
import { BlacklistService } from '../../../blacklist/blacklist.service';
import { AutomaticMeetingSuspicionAppliedEvent } from '../../../blacklist/events/automatic-meeting-suspicion-applied/automatic-meeting-suspicion-applied.event';
import { BlacklistPolicy } from '../../../core/policies/blacklist.policy';
import { MeetingRequestCreatedEvent } from '../../events/meeting-request-created/meeting-request-created.event';
import { MeetingRequestAnimalNotFoundException } from '../../exceptions/meeting-request-animal-not-found.exception';
import { MeetingRequestCuratorNotAssignedException } from '../../exceptions/meeting-request-curator-not-assigned.exception';
import { MeetingRequestsRepository } from '../../repositories/meeting-requests.repository';
import { CreateMeetingRequestCommand } from './create-meeting-request.command';
import { CreateMeetingRequestHandler } from './create-meeting-request.handler';

dayjs.extend(utc);

describe('CreateMeetingRequestHandler', () => {
	let handler: CreateMeetingRequestHandler;
	let repository: DeepMocked<MeetingRequestsRepository>;
	let eventBus: DeepMocked<EventBus>;
	let cache: DeepMocked<CacheService>;
	let blacklistPolicy: DeepMocked<BlacklistPolicy>;
	let blacklistService: DeepMocked<BlacklistService>;

	const dto: CreateMeetingRequestDto = {
		animalId: randomUUID(),
		name: 'Иван',
		phone: '+79990000000',
		email: 'ivan@example.com',
		meetingAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
		comment: 'Хочу познакомиться'
	};

	function idempotencyKeyFor(d: CreateMeetingRequestDto): string {
		return generateIdempotencyKey('v1', [
			d.animalId,
			d.name,
			d.phone,
			d.email,
			dayjs(d.meetingAt).utc().format('YYYY-MM-DDTHH:mm')
		]);
	}

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				CreateMeetingRequestHandler,
				{ provide: MeetingRequestsRepository, useValue: createMock<MeetingRequestsRepository>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() },
				{ provide: BlacklistPolicy, useValue: createMock<BlacklistPolicy>() },
				{ provide: CacheService, useValue: createMock<CacheService>() },
				{ provide: BlacklistService, useValue: createMock<BlacklistService>() }
			]
		}).compile();

		handler = module.get(CreateMeetingRequestHandler);
		repository = module.get(MeetingRequestsRepository);
		eventBus = module.get(EventBus);
		cache = module.get(CacheService);
		blacklistPolicy = module.get(BlacklistPolicy);
		blacklistService = module.get(BlacklistService);

		cache.get.mockResolvedValue(null);
		blacklistPolicy.assertCleanContacts.mockResolvedValue(undefined);
		blacklistService.suspectSource.mockResolvedValue({ updated: 1 });
		repository.evaluateMeetingFormAbuse.mockResolvedValue({ suspectPhone: false, suspectEmail: false });
	});

	it('returns cached id without hitting repository when idempotency cache hit', async () => {
		const cachedId = randomUUID();
		cache.get.mockResolvedValue({ id: cachedId });

		const result = await handler.execute(new CreateMeetingRequestCommand(dto));

		expect(result).toEqual({ id: cachedId });
		expect(blacklistPolicy.assertCleanContacts).not.toHaveBeenCalled();
		expect(repository.findAnimalWithCurator).not.toHaveBeenCalled();
		expect(repository.createIdempotent).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
		expect(cache.set).not.toHaveBeenCalled();
	});

	it('throws when blacklist rejects contacts', async () => {
		blacklistPolicy.assertCleanContacts.mockRejectedValue(new ForbiddenException('В черном списке'));

		await expect(handler.execute(new CreateMeetingRequestCommand(dto))).rejects.toThrow(ForbiddenException);
		expect(blacklistPolicy.assertCleanContacts).toHaveBeenCalledWith([
			{ source: BlacklistSource.PHONE, value: dto.phone },
			{ source: BlacklistSource.EMAIL, value: dto.email }
		]);
		expect(repository.findAnimalWithCurator).not.toHaveBeenCalled();
		expect(repository.createIdempotent).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('throws when animal not found', async () => {
		repository.findAnimalWithCurator.mockResolvedValue(undefined);
		await expect(handler.execute(new CreateMeetingRequestCommand(dto))).rejects.toThrow(
			MeetingRequestAnimalNotFoundException
		);
		expect(repository.createIdempotent).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('throws when animal has no curator', async () => {
		repository.findAnimalWithCurator.mockResolvedValue({ id: dto.animalId, curatorId: null });
		await expect(handler.execute(new CreateMeetingRequestCommand(dto))).rejects.toThrow(
			MeetingRequestCuratorNotAssignedException
		);
		expect(repository.createIdempotent).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('creates meeting request, publishes event, caches id', async () => {
		const id = randomUUID();
		const idempotencyKey = idempotencyKeyFor(dto);
		const entity = { id } as typeof meetingRequests.$inferSelect;
		repository.findAnimalWithCurator.mockResolvedValue({ id: dto.animalId, curatorId: 'curator-1' });
		repository.createIdempotent.mockResolvedValue({
			entity,
			isAlreadyExists: false,
			meetingFormAbuse: { suspectPhone: false, suspectEmail: false }
		});

		const result = await handler.execute(new CreateMeetingRequestCommand(dto));

		expect(result).toEqual({ id });
		expect(cache.get).toHaveBeenCalledWith(MeetingCacheKeys.idempotencyRequest(idempotencyKey));
		expect(repository.createIdempotent).toHaveBeenCalledWith(
			expect.objectContaining({
				animalId: dto.animalId,
				curatorUserId: 'curator-1',
				name: dto.name,
				phone: dto.phone,
				email: dto.email,
				comment: dto.comment,
				meetingAt: new Date(dto.meetingAt),
				idempotencyKey
			})
		);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish.mock.calls[0][0]).toBeInstanceOf(MeetingRequestCreatedEvent);
		expect((eventBus.publish.mock.calls[0][0] as MeetingRequestCreatedEvent).meetingRequest).toBe(entity);
		expect(cache.set).toHaveBeenCalledWith(MeetingCacheKeys.idempotencyRequest(idempotencyKey), { id }, 300);
		expect(blacklistService.suspectSource).not.toHaveBeenCalled();
		expect(repository.evaluateMeetingFormAbuse).not.toHaveBeenCalled();
	});

	it('does not publish when row already existed (idempotent create)', async () => {
		const id = randomUUID();
		const entity = { id } as typeof meetingRequests.$inferSelect;
		repository.findAnimalWithCurator.mockResolvedValue({ id: dto.animalId, curatorId: 'curator-1' });
		repository.createIdempotent.mockResolvedValue({
			entity,
			isAlreadyExists: true,
			meetingFormAbuse: { suspectPhone: false, suspectEmail: false }
		});

		const result = await handler.execute(new CreateMeetingRequestCommand(dto));

		expect(result).toEqual({ id });
		expect(eventBus.publish).not.toHaveBeenCalled();
		expect(cache.set).toHaveBeenCalled();
		expect(blacklistService.suspectSource).not.toHaveBeenCalled();
		expect(repository.evaluateMeetingFormAbuse).toHaveBeenCalledWith({
			animalId: dto.animalId,
			phone: dto.phone,
			email: dto.email
		});
	});

	it('suspects contacts and invalidates blacklist cache when abuse threshold reached', async () => {
		const id = randomUUID();
		const idempotencyKey = idempotencyKeyFor(dto);
		const entity = { id } as typeof meetingRequests.$inferSelect;
		repository.findAnimalWithCurator.mockResolvedValue({ id: dto.animalId, curatorId: 'curator-1' });
		repository.createIdempotent.mockResolvedValue({
			entity,
			isAlreadyExists: false,
			meetingFormAbuse: { suspectPhone: true, suspectEmail: false }
		});

		await handler.execute(new CreateMeetingRequestCommand(dto));

		expect(blacklistService.suspectSource).toHaveBeenCalledWith(
			null,
			MEETING_FORM_AUTOMATIC_SUSPICION_REASON,
			BlacklistContext.MEETING_FORM,
			expect.any(Date),
			{ source: BlacklistSource.PHONE, value: dto.phone }
		);
		expect(eventBus.publish).toHaveBeenCalledTimes(2);
		const events = eventBus.publish.mock.calls.map((c) => c[0]);
		expect(events.some((e) => e instanceof MeetingRequestCreatedEvent)).toBe(true);
		expect(events.some((e) => e instanceof AutomaticMeetingSuspicionAppliedEvent)).toBe(true);
		expect(cache.set).toHaveBeenCalledWith(MeetingCacheKeys.idempotencyRequest(idempotencyKey), { id }, 300);
		expect(repository.evaluateMeetingFormAbuse).not.toHaveBeenCalled();
	});

	it('re-applies suspicion on idempotent retry when abuse still holds (e.g. prior suspectSource failed)', async () => {
		const id = randomUUID();
		const idempotencyKey = idempotencyKeyFor(dto);
		const entity = { id } as typeof meetingRequests.$inferSelect;
		repository.findAnimalWithCurator.mockResolvedValue({ id: dto.animalId, curatorId: 'curator-1' });
		repository.createIdempotent.mockResolvedValue({
			entity,
			isAlreadyExists: true,
			meetingFormAbuse: { suspectPhone: false, suspectEmail: false }
		});
		repository.evaluateMeetingFormAbuse.mockResolvedValue({ suspectPhone: true, suspectEmail: false });

		await handler.execute(new CreateMeetingRequestCommand(dto));

		expect(blacklistService.suspectSource).toHaveBeenCalledWith(
			null,
			MEETING_FORM_AUTOMATIC_SUSPICION_REASON,
			BlacklistContext.MEETING_FORM,
			expect.any(Date),
			{ source: BlacklistSource.PHONE, value: dto.phone }
		);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish.mock.calls[0][0]).toBeInstanceOf(AutomaticMeetingSuspicionAppliedEvent);
		expect(cache.set).toHaveBeenCalledWith(MeetingCacheKeys.idempotencyRequest(idempotencyKey), { id }, 300);
	});
});
