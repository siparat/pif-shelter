import { ForbiddenException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListGuardianReportsItem, ListGuardianReportsResult } from '@pif/contracts';
import { animals, DatabaseService, guardianships, postMedia, posts, users } from '@pif/database';
import { GuardianshipStatusEnum, PostVisibilityEnum } from '@pif/shared';
import { and, count, desc, eq, exists, gte, inArray, isNull, lte, ne, or } from 'drizzle-orm';
import { GuardianNotFoundException } from '../../exceptions/guardian-not-found.exception';
import { ListGuardianReportsQuery } from './list-guardian-reports.query';

@QueryHandler(ListGuardianReportsQuery)
export class ListGuardianReportsHandler implements IQueryHandler<ListGuardianReportsQuery> {
	constructor(private readonly db: DatabaseService) {}

	async execute({
		userId,
		page,
		perPage,
		curatorFilterId
	}: ListGuardianReportsQuery): Promise<ListGuardianReportsResult> {
		const [user] = await this.db.client.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
		if (!user) {
			throw new GuardianNotFoundException();
		}

		if (curatorFilterId) {
			const [allowed] = await this.db.client
				.select({ id: guardianships.id })
				.from(guardianships)
				.innerJoin(animals, eq(guardianships.animalId, animals.id))
				.where(and(eq(guardianships.guardianUserId, userId), eq(animals.curatorId, curatorFilterId)))
				.limit(1);
			if (!allowed) {
				throw new ForbiddenException('Нет доступа к этому опекуну');
			}
		}

		const accessSubquery = this.db.client
			.select({ id: guardianships.id })
			.from(guardianships)
			.where(
				and(
					eq(guardianships.guardianUserId, userId),
					eq(guardianships.animalId, posts.animalId),
					ne(guardianships.status, GuardianshipStatusEnum.PENDING_PAYMENT),
					lte(guardianships.startedAt, posts.createdAt),
					or(
						isNull(guardianships.cancelledAt),
						gte(guardianships.guardianPrivilegesUntil, posts.createdAt),
						gte(guardianships.cancelledAt, posts.createdAt)
					)
				)
			);

		const baseWhere = and(eq(posts.visibility, PostVisibilityEnum.PRIVATE), exists(accessSubquery));

		const [rows, [totalRow]] = await Promise.all([
			this.db.client
				.select({
					post: posts,
					animal: animals
				})
				.from(posts)
				.innerJoin(animals, eq(animals.id, posts.animalId))
				.where(baseWhere)
				.orderBy(desc(posts.createdAt))
				.limit(perPage)
				.offset(perPage * (page - 1)),
			this.db.client
				.select({ value: count() })
				.from(posts)
				.innerJoin(animals, eq(animals.id, posts.animalId))
				.where(baseWhere)
		]);

		const postIds = rows.map((row) => row.post.id);
		const mediaRows = postIds.length
			? await this.db.client.select().from(postMedia).where(inArray(postMedia.postId, postIds))
			: [];

		const mediaByPost = new Map<string, typeof mediaRows>();
		for (const media of mediaRows) {
			const list = mediaByPost.get(media.postId) ?? [];
			list.push(media);
			mediaByPost.set(media.postId, list);
		}

		const data: ListGuardianReportsItem[] = rows.map(({ post, animal }) => {
			const media = (mediaByPost.get(post.id) ?? []).slice().sort((a, b) => a.order - b.order);
			return {
				id: post.id,
				title: post.title,
				createdAt: post.createdAt.toISOString(),
				animal: {
					id: animal.id,
					name: animal.name,
					avatarUrl: animal.avatarUrl,
					species: animal.species
				},
				media: media.map((item) => ({
					id: item.id,
					storageKey: item.storageKey,
					type: item.type,
					order: item.order
				}))
			};
		});

		const total = totalRow.value;
		const totalPages = Math.max(1, Math.ceil(total / perPage));

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
