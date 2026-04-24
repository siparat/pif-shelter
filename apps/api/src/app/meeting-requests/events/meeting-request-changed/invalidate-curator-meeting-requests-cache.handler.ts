import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { MeetingCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { MeetingRequestConfirmedEvent } from '../meeting-request-confirmed/meeting-request-confirmed.event';
import { MeetingRequestCreatedEvent } from '../meeting-request-created/meeting-request-created.event';
import { MeetingRequestRejectedEvent } from '../meeting-request-rejected/meeting-request-rejected.event';

@EventsHandler(MeetingRequestCreatedEvent, MeetingRequestConfirmedEvent, MeetingRequestRejectedEvent)
export class InvalidateCuratorMeetingRequestsCacheHandler
	implements IEventHandler<MeetingRequestCreatedEvent | MeetingRequestConfirmedEvent | MeetingRequestRejectedEvent>
{
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle(
		event: MeetingRequestCreatedEvent | MeetingRequestConfirmedEvent | MeetingRequestRejectedEvent
	): Promise<void> {
		const pattern = MeetingCacheKeys.CURATOR_LIST;
		await this.cache.delByPattern(pattern).catch(() => undefined);
		this.logger.log('Кэш заявок куратора сброшен', { curatorUserId: event.meetingRequest.curatorUserId });
	}
}
