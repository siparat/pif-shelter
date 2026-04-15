import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { BlacklistContext, BlacklistSource } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { BanContactsRequestDto, BanContactsResponseDto, ReturnData } from '../../../core/dto';
import { BlacklistService } from '../../blacklist.service';
import { ContactsBannedEvent } from '../../events/contacts-banned/contacts-banned.event';
import { BanContactsCommand } from './ban-contacts.command';
import { BanContactsHandler } from './ban-contacts.handler';

describe('BanContactsHandler', () => {
	let handler: BanContactsHandler;
	let blacklistService: DeepMocked<BlacklistService>;
	let eventBus: DeepMocked<EventBus>;
	let logger: DeepMocked<Logger>;

	const dto: BanContactsRequestDto = {
		reason: 'Explicit abuse report',
		sources: [{ source: BlacklistSource.EMAIL, value: 'test@example.com' }]
	};

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				BanContactsHandler,
				{ provide: BlacklistService, useValue: createMock<BlacklistService>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(BanContactsHandler);
		blacklistService = module.get(BlacklistService);
		eventBus = module.get(EventBus);
		logger = module.get(Logger);
	});

	it('calls service, publishes event and logs', async () => {
		const serviceResult: ReturnData<typeof BanContactsResponseDto> = { updated: 1 };
		blacklistService.banSource.mockResolvedValue(serviceResult);

		const result = await handler.execute(new BanContactsCommand(dto, 'moderator-1'));

		expect(result).toEqual(serviceResult);
		expect(blacklistService.banSource).toHaveBeenCalledWith(
			'moderator-1',
			dto.reason,
			BlacklistContext.MANUAL,
			...dto.sources
		);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish.mock.calls[0][0]).toBeInstanceOf(ContactsBannedEvent);
		expect(logger.log).toHaveBeenCalledWith(`${serviceResult.updated} контактов внесено в черный список`, {
			moderatorId: 'moderator-1',
			reason: dto.reason,
			contacts: dto.sources.map((source) => source.value)
		});
	});
});
