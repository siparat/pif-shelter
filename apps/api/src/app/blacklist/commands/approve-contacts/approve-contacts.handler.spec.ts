import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { ApproveContactsRequestDto, ApproveContactsResponseDto, ReturnDto } from '@pif/contracts';
import { BlacklistContext, BlacklistSource } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { BlacklistService } from '../../blacklist.service';
import { ContactsApprovedEvent } from '../../events/contacts-approved/contacts-approved.event';
import { ApproveContactsCommand } from './approve-contacts.command';
import { ApproveContactsHandler } from './approve-contacts.handler';

describe('ApproveContactsHandler', () => {
	let handler: ApproveContactsHandler;
	let blacklistService: DeepMocked<BlacklistService>;
	let eventBus: DeepMocked<EventBus>;
	let logger: DeepMocked<Logger>;

	const dto: ApproveContactsRequestDto = {
		sources: [{ source: BlacklistSource.EMAIL, value: 'test@example.com' }]
	};

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				ApproveContactsHandler,
				{ provide: BlacklistService, useValue: createMock<BlacklistService>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(ApproveContactsHandler);
		blacklistService = module.get(BlacklistService);
		eventBus = module.get(EventBus);
		logger = module.get(Logger);
	});

	it('calls service, publishes event and logs', async () => {
		const serviceResult: ReturnDto<typeof ApproveContactsResponseDto> = { updated: 1 };
		blacklistService.approveSource.mockResolvedValue(serviceResult);

		const result = await handler.execute(new ApproveContactsCommand(dto, 'moderator-1'));

		expect(result).toEqual(serviceResult);
		expect(blacklistService.approveSource).toHaveBeenCalledWith(
			'moderator-1',
			BlacklistContext.MANUAL,
			...dto.sources
		);
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish.mock.calls[0][0]).toBeInstanceOf(ContactsApprovedEvent);
		expect(logger.log).toHaveBeenCalledWith(`${serviceResult.updated} контактов разблокировано`, {
			moderatorId: 'moderator-1',
			contacts: dto.sources.map((source) => source.value)
		});
	});
});
