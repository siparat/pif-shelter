import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bullmq';
import { Test } from '@nestjs/testing';
import { meetingRequests } from '@pif/database';
import { MeetingQueueJobs } from '@pif/shared';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { MeetingRequestConfirmedEvent } from './meeting-request-confirmed.event';
import { ScheduleMeetingReminderHandler } from './schedule-meeting-reminder.handler';

describe('ScheduleMeetingReminderHandler', () => {
	let handler: ScheduleMeetingReminderHandler;
	let queue: DeepMocked<Queue>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				ScheduleMeetingReminderHandler,
				{ provide: getQueueToken('meeting'), useValue: createMock<Queue>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(ScheduleMeetingReminderHandler);
		queue = module.get(getQueueToken('meeting'));
	});

	it('schedules delayed reminder when meeting is far enough', async () => {
		const id = randomUUID();
		const meetingAt = new Date(Date.now() + 5 * 60 * 60 * 1000);
		await handler.handle(
			new MeetingRequestConfirmedEvent({ id, meetingAt } as unknown as typeof meetingRequests.$inferSelect)
		);

		expect(queue.add).toHaveBeenCalledTimes(1);
		const [name, payload, options] = queue.add.mock.calls[0];
		expect(name).toBe(MeetingQueueJobs.SEND_REMINDER);
		expect(payload).toEqual({ meetingRequestId: id });
		expect(options?.jobId).toBe(`${MeetingQueueJobs.SEND_REMINDER}:${id}`);
		expect((options?.delay as number) ?? 0).toBeGreaterThan(0);
	});

	it('schedules immediate reminder when meeting is near', async () => {
		const id = randomUUID();
		const meetingAt = new Date(Date.now() + 30 * 60 * 1000);
		await handler.handle(
			new MeetingRequestConfirmedEvent({ id, meetingAt } as unknown as typeof meetingRequests.$inferSelect)
		);

		const [, , options] = queue.add.mock.calls[0];
		expect(options?.delay).toBe(0);
	});
});
