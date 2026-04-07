import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { meetingRequests } from '@pif/database';
import { MeetingRequestStatusEnum } from '@pif/shared';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { ForbiddenMeetingRequestAccessException } from '../../exceptions/forbidden-meeting-request-access.exception';
import { MeetingRequestInvalidStatusException } from '../../exceptions/meeting-request-invalid-status.exception';
import { MeetingRequestNotFoundException } from '../../exceptions/meeting-request-not-found.exception';
import { MeetingRequestsPolicy } from '../../meeting-requests.policy';
import { MeetingRequestsRepository } from '../../repositories/meeting-requests.repository';
import { ConfirmMeetingRequestCommand } from './confirm-meeting-request.command';
import { ConfirmMeetingRequestHandler } from './confirm-meeting-request.handler';

describe('ConfirmMeetingRequestHandler', () => {
	let handler: ConfirmMeetingRequestHandler;
	let repository: DeepMocked<MeetingRequestsRepository>;
	let policy: DeepMocked<MeetingRequestsPolicy>;

	const id = randomUUID();
	const curatorUserId = 'curator-1';

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				ConfirmMeetingRequestHandler,
				{ provide: MeetingRequestsRepository, useValue: createMock<MeetingRequestsRepository>() },
				{ provide: MeetingRequestsPolicy, useValue: createMock<MeetingRequestsPolicy>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(ConfirmMeetingRequestHandler);
		repository = module.get(MeetingRequestsRepository);
		policy = module.get(MeetingRequestsPolicy);
	});

	it('throws when request not found', async () => {
		repository.findById.mockResolvedValue(undefined);
		await expect(handler.execute(new ConfirmMeetingRequestCommand(id, curatorUserId))).rejects.toThrow(
			MeetingRequestNotFoundException
		);
	});

	it('throws when status is not NEW', async () => {
		repository.findById.mockResolvedValue({
			status: MeetingRequestStatusEnum.REJECTED
		} as typeof meetingRequests.$inferSelect);
		await expect(handler.execute(new ConfirmMeetingRequestCommand(id, curatorUserId))).rejects.toThrow(
			MeetingRequestInvalidStatusException
		);
	});

	it('throws when policy forbids access', async () => {
		repository.findById.mockResolvedValue({
			status: MeetingRequestStatusEnum.NEW,
			curatorUserId: 'curator-2'
		} as typeof meetingRequests.$inferSelect);
		policy.assertCanManageByCurator.mockImplementation(() => {
			throw new ForbiddenMeetingRequestAccessException();
		});
		await expect(handler.execute(new ConfirmMeetingRequestCommand(id, curatorUserId))).rejects.toThrow(
			ForbiddenMeetingRequestAccessException
		);
	});
});
