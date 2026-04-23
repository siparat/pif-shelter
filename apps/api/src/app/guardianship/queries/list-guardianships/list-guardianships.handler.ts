import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListGuardianshipsResult } from '@pif/contracts';
import { animals, DatabaseService, guardianships, users } from '@pif/database';
import { and, asc, count, desc, eq, SQL } from 'drizzle-orm';
import { ListGuardianshipsQuery } from './list-guardianships.query';

const SORT_FIELDS = ['startedAt', 'paidPeriodEndAt', 'cancelledAt'] as const;
type SortField = (typeof SORT_FIELDS)[number];

const DEFAULT_SORT: { field: SortField; direction: 'asc' | 'desc' } = {
	field: 'startedAt',
	direction: 'desc'
};

function parseSort(sort: string | undefined): { field: SortField; direction: 'asc' | 'desc' } {
	if (!sort) {
		return DEFAULT_SORT;
	}
	const [rawField, rawDirection] = sort.split(':');
	const field = SORT_FIELDS.includes(rawField as SortField) ? (rawField as SortField) : DEFAULT_SORT.field;
	const direction = rawDirection === 'asc' ? 'asc' : 'desc';
	return { field, direction };
}

@QueryHandler(ListGuardianshipsQuery)
export class ListGuardianshipsHandler implements IQueryHandler<ListGuardianshipsQuery> {
	constructor(private readonly db: DatabaseService) {}

	async execute({ dto }: ListGuardianshipsQuery): Promise<ListGuardianshipsResult> {
		const { page = 1, perPage = 20, status, animalId, curatorId, guardianUserId } = dto;
		const { field: sortField, direction } = parseSort(dto.sort);
		const sortColumn = guardianships[sortField];
		const orderBy = direction === 'asc' ? asc(sortColumn) : desc(sortColumn);

		const conditions: SQL[] = [];
		if (status != null) {
			conditions.push(eq(guardianships.status, status));
		}
		if (animalId != null) {
			conditions.push(eq(guardianships.animalId, animalId));
		}
		if (guardianUserId != null) {
			conditions.push(eq(guardianships.guardianUserId, guardianUserId));
		}
		if (curatorId != null) {
			conditions.push(eq(animals.curatorId, curatorId));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const [rows, [totalRow]] = await Promise.all([
			this.db.client
				.select({
					guardianship: guardianships,
					animal: animals,
					guardian: users
				})
				.from(guardianships)
				.innerJoin(animals, eq(guardianships.animalId, animals.id))
				.innerJoin(users, eq(guardianships.guardianUserId, users.id))
				.where(whereClause)
				.orderBy(orderBy)
				.limit(perPage)
				.offset(perPage * (page - 1)),
			this.db.client
				.select({ value: count() })
				.from(guardianships)
				.innerJoin(animals, eq(guardianships.animalId, animals.id))
				.where(whereClause)
		]);

		const total = totalRow.value;
		const totalPages = Math.max(1, Math.ceil(total / perPage));

		const data: ListGuardianshipsResult['data'] = rows.map(({ guardianship, animal, guardian }) => ({
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
				id: guardian.id,
				name: guardian.name,
				email: guardian.email,
				telegram: guardian.telegram,
				telegramChatId: guardian.telegramChatId,
				telegramUnreachable: guardian.telegramUnreachable
			}
		}));

		return {
			success: true,
			data,
			meta: {
				total,
				page,
				perPage,
				totalPages
			}
		};
	}
}
