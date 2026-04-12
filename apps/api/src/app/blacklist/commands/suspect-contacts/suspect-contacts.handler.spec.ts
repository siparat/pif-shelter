import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BadRequestException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ReturnDto, SuspectContactsRequestDto, SuspectContactsResponseDto } from '@pif/contracts';
import { BlacklistContext, BlacklistSource } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { BlacklistService } from '../../blacklist.service';
import { ContactsSuspectedEvent } from '../../events/contacts-suspected/contacts-suspected.event';
import { SuspectContactsCommand } from './suspect-contacts.command';
import { SuspectContactsHandler } from './suspect-contacts.handler';

describe('SuspectContactsHandler', () => {
	let handler: SuspectContactsHandler;
	let blacklistService: DeepMocked<BlacklistService>;
	let eventBus: DeepMocked<EventBus>;
	let logger: DeepMocked<Logger>;

	const dto: SuspectContactsRequestDto = {
		reason: 'Suspicious contact activity',
		suspicionEndsAt: '2030-01-01T00:00:00.000Z',
		sources: [{ source: BlacklistSource.EMAIL, value: 'test@example.com' }]
	};

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				SuspectContactsHandler,
				{ provide: BlacklistService, useValue: createMock<BlacklistService>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(SuspectContactsHandler);
		blacklistService = module.get(BlacklistService);
		eventBus = module.get(EventBus);
		logger = module.get(Logger);
	});

	it('throws BadRequestException when suspicionEndsAt is invalid', async () => {
		const invalidDto: SuspectContactsRequestDto = { ...dto, suspicionEndsAt: 'invalid-date' };

		await expect(handler.execute(new SuspectContactsCommand(invalidDto, 'moderator-1'))).rejects.toThrow(
			BadRequestException
		);
		expect(blacklistService.suspectSource).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
		expect(logger.log).not.toHaveBeenCalled();
	});

	it('calls service, publishes event and logs when payload is valid', async () => {
		const serviceResult: ReturnDto<typeof SuspectContactsResponseDto> = { updated: 1 };
		blacklistService.suspectSource.mockResolvedValue(serviceResult);

		const result = await handler.execute(new SuspectContactsCommand(dto, 'moderator-1'));

		expect(result).toEqual(serviceResult);
		expect(blacklistService.suspectSource).toHaveBeenCalledWith(
			'moderator-1',
			dto.reason,
			BlacklistContext.MANUAL,
			new Date(dto.suspicionEndsAt),
			...dto.sources
		);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish.mock.calls[0][0]).toBeInstanceOf(ContactsSuspectedEvent);
		expect(logger.log).toHaveBeenCalledWith(`${serviceResult.updated} контактов внесено в подозрение`, {
			moderatorId: 'moderator-1',
			reason: dto.reason,
			contacts: dto.sources.map((source) => source.value)
		});
	});
});
