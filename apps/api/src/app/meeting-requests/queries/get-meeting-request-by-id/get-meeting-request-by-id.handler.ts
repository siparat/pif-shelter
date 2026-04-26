import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMeetingRequestByIdResponseDto, ReturnData } from '../../../core/dto';
import { MeetingRequestNotFoundException } from '../../exceptions/meeting-request-not-found.exception';
import { MeetingRequestsPolicy } from '../../meeting-requests.policy';
import { DrizzleMeetingRequestsRepository } from '../../repositories/drizzle-meeting-requests.repository';
import { GetMeetingRequestByIdQuery } from './get-meeting-request-by-id.query';

@QueryHandler(GetMeetingRequestByIdQuery)
export class GetMeetingRequestByIdHandler implements IQueryHandler<GetMeetingRequestByIdQuery> {
	constructor(
		private readonly policy: MeetingRequestsPolicy,
		private readonly repo: DrizzleMeetingRequestsRepository
	) {}

	async execute({
		id,
		requesterUserId
	}: GetMeetingRequestByIdQuery): Promise<ReturnData<typeof GetMeetingRequestByIdResponseDto>> {
		const row = await this.repo.getDetailedById(id);
		if (!row) {
			throw new MeetingRequestNotFoundException();
		}
		await this.policy.assertCanManageByCurator(row.request.curatorUserId, requesterUserId);

		return {
			id: row.request.id,
			animalId: row.request.animalId,
			curatorUserId: row.request.curatorUserId,
			name: row.request.name,
			phone: row.request.phone,
			email: row.request.email,
			comment: row.request.comment,
			meetingAt: row.request.meetingAt.toISOString(),
			status: row.request.status,
			isSuspicious: row.request.isSuspicious,
			confirmedAt: row.request.confirmedAt?.toISOString() ?? null,
			rejectedAt: row.request.rejectedAt?.toISOString() ?? null,
			rejectionReason: row.request.rejectionReason,
			createdAt: row.request.createdAt.toISOString(),
			updatedAt: row.request.updatedAt?.toISOString(),
			animal: row.animal,
			curator: row.curator
		};
	}
}
