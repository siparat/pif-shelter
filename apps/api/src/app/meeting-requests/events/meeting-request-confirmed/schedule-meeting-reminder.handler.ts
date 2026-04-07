import { InjectQueue } from '@nestjs/bullmq';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MEETING_QUEUE_NAME, MeetingQueueJobs } from '@pif/shared';
import { Queue } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { SendMeetingReminderJob } from '../../jobs/send-meeting-reminder.job';
import { MeetingRequestConfirmedEvent } from './meeting-request-confirmed.event';

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

@EventsHandler(MeetingRequestConfirmedEvent)
export class ScheduleMeetingReminderHandler implements IEventHandler<MeetingRequestConfirmedEvent> {
	constructor(
		private readonly logger: Logger,
		@InjectQueue(MEETING_QUEUE_NAME) private readonly queue: Queue<SendMeetingReminderJob>
	) {}

	async handle({ meetingRequest }: MeetingRequestConfirmedEvent): Promise<void> {
		const name = MeetingQueueJobs.SEND_REMINDER;
		const jobId = `${name}:${meetingRequest.id}`;
		const delay = Math.max(0, meetingRequest.meetingAt.getTime() - Date.now() - TWO_HOURS_MS);
		await this.queue.add(name, { meetingRequestId: meetingRequest.id }, { jobId, delay });
		this.logger.log('Задача напоминания о встрече добавлена', {
			meetingRequestId: meetingRequest.id,
			jobId,
			delay
		});
	}
}
