import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { ListCuratorMeetingRequestsResult, MeetingRequestsSort } from '@pif/contracts';
import { animals, DatabaseService, meetingRequests, users } from '@pif/database';
import { MeetingCacheKeys, UserRole } from '@pif/shared';
import { and, asc, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { ListCuratorMeetingRequestsQuery } from './list-curator-meeting-requests.query';

@QueryHandler(ListCuratorMeetingRequestsQuery)
export class ListCuratorMeetingRequestsHandler implements IQueryHandler<ListCuratorMeetingRequestsQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({ dto, curatorUserId }: ListCuratorMeetingRequestsQuery): Promise<ListCuratorMeetingRequestsResult> {
		const { page = 1, perPage = 20, status, sort = 'createdAt:desc' } = dto;
		const cacheKey = this.cache.buildQueryKey(MeetingCacheKeys.CURATOR_LIST, { dto, curatorUserId });
		const cached = await this.cache.get<ListCuratorMeetingRequestsResult>(cacheKey).catch(() => null);
		if (cached) {
			return cached;
		}

		const whereClause = and(
			or(
				eq(meetingRequests.curatorUserId, curatorUserId),
				inArray(users.role, [UserRole.ADMIN, UserRole.SENIOR_VOLUNTEER])
			),
			status ? eq(meetingRequests.status, status) : undefined
		);
		const orderByExpr = this.getOrderByExpr(sort);

		const rows = await this.db.client
			.select({
				request: meetingRequests,
				animal: {
					id: animals.id,
					name: animals.name,
					avatarUrl: animals.avatarUrl
				},
				curator: {
					id: users.id,
					name: users.name,
					email: users.email
				},
				total: sql<number>`count(*) over()`
			})
			.from(meetingRequests)
			.innerJoin(animals, eq(animals.id, meetingRequests.animalId))
			.innerJoin(users, eq(users.id, meetingRequests.curatorUserId))
			.where(whereClause)
			.orderBy(orderByExpr)
			.limit(perPage)
			.offset((page - 1) * perPage);

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

		const total = rows[0]?.total ?? 0;
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

	private getOrderByExpr(sort: MeetingRequestsSort): ReturnType<typeof desc> {
		switch (sort) {
			case 'createdAt:asc':
				return asc(meetingRequests.createdAt);
			case 'meetingAt:asc':
				return asc(meetingRequests.meetingAt);
			case 'meetingAt:desc':
				return desc(meetingRequests.meetingAt);
			case 'createdAt:desc':
			default:
				return desc(meetingRequests.createdAt);
		}
	}
}
