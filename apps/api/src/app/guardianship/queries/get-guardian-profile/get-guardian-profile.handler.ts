import { ForbiddenException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetGuardianProfileResult, ReturnData } from '@pif/contracts';
import { animals, DatabaseService, guardianships, users } from '@pif/database';
import { GuardianshipStatusEnum } from '@pif/shared';
import { and, desc, eq } from 'drizzle-orm';
import { GuardianNotFoundException } from '../../exceptions/guardian-not-found.exception';
import { GetGuardianProfileQuery } from './get-guardian-profile.query';

@QueryHandler(GetGuardianProfileQuery)
export class GetGuardianProfileHandler implements IQueryHandler<GetGuardianProfileQuery> {
	constructor(private readonly db: DatabaseService) {}

	async execute({ userId, curatorFilterId }: GetGuardianProfileQuery): Promise<ReturnData<GetGuardianProfileResult>> {
		const [user] = await this.db.client.select().from(users).where(eq(users.id, userId)).limit(1);
		if (!user) {
			throw new GuardianNotFoundException();
		}

		const conditions = [eq(guardianships.guardianUserId, userId)];
		if (curatorFilterId) {
			conditions.push(eq(animals.curatorId, curatorFilterId));
		}

		const rows = await this.db.client
			.select({
				guardianship: guardianships,
				animal: animals
			})
			.from(guardianships)
			.innerJoin(animals, eq(guardianships.animalId, animals.id))
			.where(and(...conditions))
			.orderBy(desc(guardianships.startedAt));

		if (curatorFilterId && rows.length === 0) {
			throw new ForbiddenException('Нет доступа к этому опекуну');
		}

		const items: GetGuardianProfileResult['data']['guardianships'] = rows.map(({ guardianship, animal }) => ({
			id: guardianship.id,
			animalId: guardianship.animalId,
			status: guardianship.status,
			subscriptionId: guardianship.subscriptionId,
			startedAt: guardianship.startedAt.toISOString(),
			paidPeriodEndAt: guardianship.paidPeriodEndAt?.toISOString() ?? null,
			cancelledAt: guardianship.cancelledAt?.toISOString() ?? null,
			guardianPrivilegesUntil: guardianship.guardianPrivilegesUntil?.toISOString() ?? null,
			animal: {
				id: animal.id,
				name: animal.name,
				avatarUrl: animal.avatarUrl,
				species: animal.species,
				curatorId: animal.curatorId,
				costOfGuardianship: animal.costOfGuardianship != null ? Number(animal.costOfGuardianship) : null
			},
			guardian: {
				id: user.id,
				name: user.name,
				email: user.email,
				telegram: user.telegram,
				telegramChatId: user.telegramChatId,
				telegramUnreachable: user.telegramUnreachable
			}
		}));

		const activeCount = items.filter((it) => it.status === GuardianshipStatusEnum.ACTIVE).length;
		const pendingPaymentCount = items.filter((it) => it.status === GuardianshipStatusEnum.PENDING_PAYMENT).length;
		const cancelledCount = items.filter((it) => it.status === GuardianshipStatusEnum.CANCELLED).length;
		const monthlyContribution = items
			.filter((it) => it.status === GuardianshipStatusEnum.ACTIVE)
			.reduce((sum, it) => sum + (it.animal.costOfGuardianship ?? 0), 0);

		const startedAtDates = items.map((it) => new Date(it.startedAt).getTime());
		const firstGuardianshipAt = startedAtDates.length ? new Date(Math.min(...startedAtDates)).toISOString() : null;

		const activityDates: number[] = [];
		for (const it of items) {
			activityDates.push(new Date(it.startedAt).getTime());
			if (it.paidPeriodEndAt) {
				activityDates.push(new Date(it.paidPeriodEndAt).getTime());
			}
			if (it.cancelledAt) {
				activityDates.push(new Date(it.cancelledAt).getTime());
			}
		}
		const lastActivityAt = activityDates.length ? new Date(Math.max(...activityDates)).toISOString() : null;

		return {
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				role: user.role,
				telegram: user.telegram,
				telegramChatId: user.telegramChatId,
				telegramUnreachable: user.telegramUnreachable,
				banned: user.banned,
				telegramChatIdUpdatedAt: user.telegramChatIdUpdatedAt?.toISOString() ?? null,
				createdAt: user.createdAt.toISOString(),
				updatedAt: user.updatedAt?.toISOString() ?? null
			},
			stats: {
				activeCount,
				pendingPaymentCount,
				cancelledCount,
				totalCount: items.length,
				monthlyContribution,
				firstGuardianshipAt,
				lastActivityAt
			},
			guardianships: items
		};
	}
}
