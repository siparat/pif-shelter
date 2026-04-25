import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { blacklist, DatabaseService, meetingRequests, wishlistItems } from '@pif/database';
import { BlacklistStatus, MeetingRequestStatusEnum, WishlistItemStatusEnum } from '@pif/shared';
import { and, count, eq, gte, lt, ne } from 'drizzle-orm';
import { GetAdminDashboardSummaryResponseDto, ReturnData } from '../../../../core/dto';
import { GetAdminDashboardSummaryQuery } from './get-admin-dashboard-summary.query';

const ADMIN_DASHBOARD_SUMMARY_CACHE_NAMESPACE = 'admin:dashboard:summary';

@QueryHandler(GetAdminDashboardSummaryQuery)
export class GetAdminDashboardSummaryHandler implements IQueryHandler<GetAdminDashboardSummaryQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({
		userId
	}: GetAdminDashboardSummaryQuery): Promise<ReturnData<typeof GetAdminDashboardSummaryResponseDto>> {
		const cacheKey = this.cache.buildQueryKey(ADMIN_DASHBOARD_SUMMARY_CACHE_NAMESPACE, { userId });
		const cached = await this.cache
			.get<ReturnData<typeof GetAdminDashboardSummaryResponseDto>>(cacheKey)
			.catch(() => null);
		if (cached) {
			return cached;
		}

		const now = new Date();
		const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

		const [
			[newCount],
			[upcoming24hCount],
			[myNewCount],
			[myUpcoming24hCount],
			[suspiciousContactsCount],
			[sosCount],
			[activeItemsCount]
		] = await Promise.all([
			this.db.client
				.select({ count: count() })
				.from(meetingRequests)
				.where(eq(meetingRequests.status, MeetingRequestStatusEnum.NEW)),
			this.db.client
				.select({ count: count() })
				.from(meetingRequests)
				.where(
					and(
						eq(meetingRequests.status, MeetingRequestStatusEnum.CONFIRMED),
						gte(meetingRequests.meetingAt, now),
						lt(meetingRequests.meetingAt, in24h)
					)
				),
			this.db.client
				.select({ count: count() })
				.from(meetingRequests)
				.where(
					and(
						eq(meetingRequests.status, MeetingRequestStatusEnum.NEW),
						eq(meetingRequests.curatorUserId, userId)
					)
				),
			this.db.client
				.select({ count: count() })
				.from(meetingRequests)
				.where(
					and(
						eq(meetingRequests.status, MeetingRequestStatusEnum.CONFIRMED),
						eq(meetingRequests.curatorUserId, userId),
						gte(meetingRequests.meetingAt, now),
						lt(meetingRequests.meetingAt, in24h)
					)
				),
			this.db.client
				.select({ count: count() })
				.from(blacklist)
				.where(eq(blacklist.status, BlacklistStatus.SUSPICION)),
			this.db.client
				.select({ count: count() })
				.from(wishlistItems)
				.where(eq(wishlistItems.status, WishlistItemStatusEnum.SOS)),
			this.db.client
				.select({ count: count() })
				.from(wishlistItems)
				.where(ne(wishlistItems.status, WishlistItemStatusEnum.NOT_NEEDED))
		]);

		const result: ReturnData<typeof GetAdminDashboardSummaryResponseDto> = {
			meetingRequests: {
				newCount: newCount.count,
				upcoming24hCount: upcoming24hCount.count,
				myNewCount: myNewCount.count,
				myUpcoming24hCount: myUpcoming24hCount.count
			},
			blacklist: {
				suspiciousContactsCount: suspiciousContactsCount.count
			},
			wishlist: {
				sosCount: sosCount.count,
				activeItemsCount: activeItemsCount.count
			}
		};
		await this.cache.set(cacheKey, result, 60).catch(() => undefined);
		return result;
	}
}
