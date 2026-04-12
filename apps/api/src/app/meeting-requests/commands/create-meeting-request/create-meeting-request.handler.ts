import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { CreateMeetingRequestResponseDto, ReturnDto } from '@pif/contracts';
import {
	BlacklistContext,
	BlacklistSource,
	MEETING_FORM_AUTOMATIC_SUSPICION_DAYS,
	MEETING_FORM_AUTOMATIC_SUSPICION_REASON,
	generateIdempotencyKey,
	MeetingCacheKeys
} from '@pif/shared';
import dayjs from 'dayjs';
import { Logger } from 'nestjs-pino';
import { BlacklistService } from '../../../blacklist/blacklist.service';
import { AutomaticMeetingSuspicionAppliedEvent } from '../../../blacklist/events/automatic-meeting-suspicion-applied/automatic-meeting-suspicion-applied.event';
import { IBlacklistSource } from '../../../blacklist/repositories/blacklist.repository';
import { BlacklistPolicy, IBlacklistPolicyItem } from '../../../core/policies/blacklist.policy';
import { MeetingRequestCreatedEvent } from '../../events/meeting-request-created/meeting-request-created.event';
import { MeetingRequestAnimalNotFoundException } from '../../exceptions/meeting-request-animal-not-found.exception';
import { MeetingRequestCuratorNotAssignedException } from '../../exceptions/meeting-request-curator-not-assigned.exception';
import { MeetingRequestsRepository } from '../../repositories/meeting-requests.repository';
import { CreateMeetingRequestCommand } from './create-meeting-request.command';

@CommandHandler(CreateMeetingRequestCommand)
export class CreateMeetingRequestHandler implements ICommandHandler<CreateMeetingRequestCommand> {
	constructor(
		private readonly repository: MeetingRequestsRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger,
		private readonly cache: CacheService,
		private readonly blacklistPolicy: BlacklistPolicy,
		private readonly blacklistService: BlacklistService
	) {}

	async execute({ dto }: CreateMeetingRequestCommand): Promise<ReturnDto<typeof CreateMeetingRequestResponseDto>> {
		const idempotencyKey = generateIdempotencyKey('v1', [
			dto.animalId,
			dto.name,
			dto.phone,
			dto.email,
			dayjs(dto.meetingAt).utc().format('YYYY-MM-DDTHH:mm')
		]);
		const cacheKey = MeetingCacheKeys.idempotencyRequest(idempotencyKey);
		const cachedResult = await this.cache.get<{ id: string }>(cacheKey).catch(() => null);
		if (cachedResult) {
			return cachedResult;
		}

		const contacts: IBlacklistPolicyItem[] = [{ source: BlacklistSource.PHONE, value: dto.phone }];
		if (dto.email) {
			contacts.push({ source: BlacklistSource.EMAIL, value: dto.email });
		}
		await this.blacklistPolicy.assertCleanContacts(contacts);

		const animal = await this.repository.findAnimalWithCurator(dto.animalId);
		if (!animal) {
			throw new MeetingRequestAnimalNotFoundException();
		}
		if (!animal.curatorId) {
			throw new MeetingRequestCuratorNotAssignedException();
		}

		const { entity, isAlreadyExists, meetingFormAbuse } = await this.repository.createIdempotent({
			animalId: dto.animalId,
			curatorUserId: animal.curatorId,
			name: dto.name,
			phone: dto.phone,
			email: dto.email ?? null,
			comment: dto.comment ?? null,
			meetingAt: new Date(dto.meetingAt),
			idempotencyKey
		});

		const abuse = isAlreadyExists
			? await this.repository.evaluateMeetingFormAbuse({
					animalId: dto.animalId,
					phone: dto.phone,
					email: dto.email ?? null
				})
			: meetingFormAbuse;

		if (!isAlreadyExists) {
			await this.eventBus.publish(new MeetingRequestCreatedEvent(entity));
			this.logger.log('Создана заявка на встречу', {
				meetingRequestId: entity.id,
				animalId: dto.animalId,
				idempotencyKey
			});
		}

		if (abuse.suspectPhone || abuse.suspectEmail) {
			const sources: IBlacklistSource[] = [];
			if (abuse.suspectPhone) {
				sources.push({ source: BlacklistSource.PHONE, value: dto.phone });
			}
			if (abuse.suspectEmail && dto.email) {
				sources.push({ source: BlacklistSource.EMAIL, value: dto.email });
			}
			if (sources.length > 0) {
				const endsAt = dayjs().add(MEETING_FORM_AUTOMATIC_SUSPICION_DAYS, 'day').toDate();
				const result = await this.blacklistService.suspectSource(
					null,
					MEETING_FORM_AUTOMATIC_SUSPICION_REASON,
					BlacklistContext.MEETING_FORM,
					endsAt,
					...sources
				);
				await this.eventBus.publish(new AutomaticMeetingSuspicionAppliedEvent());
				this.logger.log('Контакты внесены в подозрение из-за частых заявок на встречу', {
					meetingRequestId: entity.id,
					animalId: dto.animalId,
					updated: result.updated
				});
			}
		}

		await this.cache.set(cacheKey, { id: entity.id }, 300).catch(() => null);

		return { id: entity.id };
	}
}
