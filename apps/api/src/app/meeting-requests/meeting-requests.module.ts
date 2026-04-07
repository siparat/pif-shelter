import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MEETING_QUEUE_NAME } from '@pif/shared';
import { ConfirmMeetingRequestHandler } from './commands/confirm-meeting-request/confirm-meeting-request.handler';
import { CreateMeetingRequestHandler } from './commands/create-meeting-request/create-meeting-request.handler';
import { RejectMeetingRequestHandler } from './commands/reject-meeting-request/reject-meeting-request.handler';
import { ScheduleMeetingReminderHandler } from './events/meeting-request-confirmed/schedule-meeting-reminder.handler';
import { InvalidateCuratorMeetingRequestsCacheHandler } from './events/meeting-request-changed/invalidate-curator-meeting-requests-cache.handler';
import { MeetingRequestsProcessor } from './meeting-requests.processor';
import { MeetingRequestsController } from './meeting-requests.controller';
import { MeetingRequestsPolicy } from './meeting-requests.policy';
import { GetMeetingRequestByIdHandler } from './queries/get-meeting-request-by-id/get-meeting-request-by-id.handler';
import { ListCuratorMeetingRequestsHandler } from './queries/list-curator-meeting-requests/list-curator-meeting-requests.handler';
import { DrizzleMeetingRequestsRepository } from './repositories/drizzle-meeting-requests.repository';
import { MeetingRequestsRepository } from './repositories/meeting-requests.repository';
import { MeetingRequestRejectedHandler } from './events/meeting-request-rejected/meeting-request-rejected.handler';

@Module({
	imports: [BullModule.registerQueue({ name: MEETING_QUEUE_NAME }), CqrsModule],
	controllers: [MeetingRequestsController],
	providers: [
		MeetingRequestsPolicy,
		CreateMeetingRequestHandler,
		ConfirmMeetingRequestHandler,
		RejectMeetingRequestHandler,
		MeetingRequestRejectedHandler,
		ListCuratorMeetingRequestsHandler,
		GetMeetingRequestByIdHandler,
		ScheduleMeetingReminderHandler,
		InvalidateCuratorMeetingRequestsCacheHandler,
		MeetingRequestsProcessor,
		DrizzleMeetingRequestsRepository,
		{
			provide: MeetingRequestsRepository,
			useClass: DrizzleMeetingRequestsRepository
		}
	]
})
export class MeetingRequestsModule {}
