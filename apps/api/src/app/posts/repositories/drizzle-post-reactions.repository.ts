import { Injectable } from '@nestjs/common';
import { DatabaseService, postReactions } from '@pif/database';
import { and, count, eq, inArray, sql } from 'drizzle-orm';
import { PostReactionCount, PostReactionsRepository } from './post-reactions.repository';

@Injectable()
export class DrizzlePostReactionsRepository implements PostReactionsRepository {
	constructor(private readonly db: DatabaseService) {}

	async upsertOrRemove(postId: string, anonymousVisitorId: string, emoji: string): Promise<void> {
		const [existing] = await this.db.client
			.select()
			.from(postReactions)
			.where(and(eq(postReactions.postId, postId), eq(postReactions.anonymousVisitorId, anonymousVisitorId)))
			.limit(1);

		if (!existing) {
			await this.db.client.insert(postReactions).values({
				postId,
				anonymousVisitorId,
				emoji
			});
			return;
		}
		if (existing.emoji === emoji) {
			await this.db.client
				.delete(postReactions)
				.where(and(eq(postReactions.postId, postId), eq(postReactions.anonymousVisitorId, anonymousVisitorId)));
			return;
		}
		await this.db.client
			.update(postReactions)
			.set({ emoji })
			.where(and(eq(postReactions.postId, postId), eq(postReactions.anonymousVisitorId, anonymousVisitorId)));
	}

	async getCountsByPostId(postId: string, anonymousVisitorId?: string): Promise<PostReactionCount[]> {
		const rows = await this.db.client
			.select({
				isActive: anonymousVisitorId
					? sql<boolean>`bool_or(${postReactions.anonymousVisitorId} = ${anonymousVisitorId})`
					: sql<boolean>`false`,
				emoji: postReactions.emoji,
				count: count()
			})
			.from(postReactions)
			.where(eq(postReactions.postId, postId))
			.groupBy(postReactions.emoji);

		return rows.map((r) => ({ emoji: r.emoji, count: Number(r.count), isActive: r.isActive }));
	}

	async getCountsByPostIds(
		postIds: string[],
		anonymousVisitorId?: string
	): Promise<Map<string, PostReactionCount[]>> {
		if (postIds.length === 0) {
			return new Map();
		}

		const rows = await this.db.client
			.select({
				postId: postReactions.postId,
				emoji: postReactions.emoji,
				count: count(),
				isActive: anonymousVisitorId
					? sql<boolean>`bool_or(${postReactions.anonymousVisitorId} = ${anonymousVisitorId})`
					: sql<boolean>`false`
			})
			.from(postReactions)
			.where(inArray(postReactions.postId, postIds))
			.groupBy(postReactions.postId, postReactions.emoji);

		const map = new Map<string, PostReactionCount[]>();
		for (const r of rows) {
			const list = map.get(r.postId) ?? [];
			list.push({ emoji: r.emoji, count: Number(r.count), isActive: r.isActive });
			map.set(r.postId, list);
		}
		return map;
	}
}
