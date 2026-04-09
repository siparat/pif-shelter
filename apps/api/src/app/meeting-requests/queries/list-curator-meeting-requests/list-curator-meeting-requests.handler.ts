import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { ListCuratorMeetingRequestsResult } from '@pif/contracts';
import { animals, DatabaseService, meetingRequests, users } from '@pif/database';
import { MeetingCacheKeys } from '@pif/shared';
import { and, count, desc, eq } from 'drizzle-orm';
import { ListCuratorMeetingRequestsQuery } from './list-curator-meeting-requests.query';

@QueryHandler(ListCuratorMeetingRequestsQuery)
export class ListCuratorMeetingRequestsHandler implements IQueryHandler<ListCuratorMeetingRequestsQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({ dto, curatorUserId }: ListCuratorMeetingRequestsQuery): Promise<ListCuratorMeetingRequestsResult> {
		const { page = 1, perPage = 20, status } = dto;
		const cacheKey = this.cache.buildQueryKey(MeetingCacheKeys.CURATOR_LIST, { dto, curatorUserId });
		const cached = await this.cache.get<ListCuratorMeetingRequestsResult>(cacheKey).catch(() => null);
		if (cached) {
			return cached;
		}

		const whereClause = and(
			eq(meetingRequests.curatorUserId, curatorUserId),
			status ? eq(meetingRequests.status, status) : undefined
		);

		const [rows, [totalRow]] = await Promise.all([
			this.db.client
				.select({
					request: meetingRequests,
					animal: { id: animals.id, name: animals.name, avatarUrl: animals.avatarUrl },
					curator: { id: users.id, name: users.name, email: users.email }
				})
				.from(meetingRequests)
				.innerJoin(animals, eq(animals.id, meetingRequests.animalId))
				.innerJoin(users, eq(users.id, meetingRequests.curatorUserId))
				.where(whereClause)
				.orderBy(desc(meetingRequests.createdAt))
				.limit(perPage)
				.offset((page - 1) * perPage),
			this.db.client.select({ count: count() }).from(meetingRequests).where(whereClause)
		]);

		const data = rows.map(({ request, animal, curator }) => ({
			id: request.id,
			animalId: request.animalId,
			curatorUserId: request.curatorUserId,
			name: request.name,
			phone: request.phone,
			email: request.email,
			comment: request.comment,
			meetingAt: request.meetingAt.toISOString(),
			status: request.status,
			confirmedAt: request.confirmedAt?.toISOString() ?? null,
			rejectedAt: request.rejectedAt?.toISOString() ?? null,
			rejectionReason: request.rejectionReason,
			isSuspicious: request.isSuspicious,
			createdAt: request.createdAt.toISOString(),
			updatedAt: request.updatedAt?.toISOString(),
			animal,
			curator
		}));

		const total = totalRow.count;
		const result: ListCuratorMeetingRequestsResult = {
			data,
			meta: {
				total,
				page,
				perPage,
				totalPages: Math.ceil(total / perPage)
			}
		};
		await this.cache.set(cacheKey, result).catch(() => undefined);
		return result;
	}
}
