import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { DeleteContactFromBlacklistResponseDto, ReturnDto } from '@pif/contracts';
import { Logger } from 'nestjs-pino';
import { BlacklistService } from '../../blacklist.service';
import { ContactDeletedFromBlacklistEvent } from '../../events/contact-deleted-from-blacklist/contact-deleted-from-blacklist.event';
import { DeleteContactFromBlacklistCommand } from './delete-contact-from-blacklist.command';
import { DeleteContactFromBlacklistHandler } from './delete-contact-from-blacklist.handler';

describe('DeleteContactFromBlacklistHandler', () => {
	let handler: DeleteContactFromBlacklistHandler;
	let blacklistService: DeepMocked<BlacklistService>;
	let eventBus: DeepMocked<EventBus>;
	let logger: DeepMocked<Logger>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				DeleteContactFromBlacklistHandler,
				{ provide: BlacklistService, useValue: createMock<BlacklistService>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(DeleteContactFromBlacklistHandler);
		blacklistService = module.get(BlacklistService);
		eventBus = module.get(EventBus);
		logger = module.get(Logger);
	});

	it('publishes event and logs when delete succeeds', async () => {
		const serviceResult: ReturnDto<typeof DeleteContactFromBlacklistResponseDto> = { ok: true };
		blacklistService.delete.mockResolvedValue(serviceResult);

		const result = await handler.execute(new DeleteContactFromBlacklistCommand('blacklist-id', 'moderator-1'));

		expect(result).toEqual(serviceResult);
		expect(blacklistService.delete).toHaveBeenCalledWith('blacklist-id');
		expect(eventBus.publish).toHaveBeenCalledTimes(1);
		expect(eventBus.publish.mock.calls[0][0]).toBeInstanceOf(ContactDeletedFromBlacklistEvent);
		expect(logger.log).toHaveBeenCalledWith('Удалена запись из черного списка', {
			id: 'blacklist-id',
			moderatorId: 'moderator-1'
		});
	});

	it('does not publish event and does not log when delete did not affect rows', async () => {
		const serviceResult: ReturnDto<typeof DeleteContactFromBlacklistResponseDto> = { ok: false };
		blacklistService.delete.mockResolvedValue(serviceResult);

		const result = await handler.execute(new DeleteContactFromBlacklistCommand('blacklist-id', 'moderator-1'));

		expect(result).toEqual(serviceResult);
		expect(blacklistService.delete).toHaveBeenCalledWith('blacklist-id');
		expect(eventBus.publish).not.toHaveBeenCalled();
		expect(logger.log).not.toHaveBeenCalled();
	});
});
