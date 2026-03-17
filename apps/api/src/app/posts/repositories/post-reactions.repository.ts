export type PostReactionCount = { emoji: string; count: number; isActive: boolean };

export abstract class PostReactionsRepository {
	abstract upsertOrRemove(postId: string, anonymousVisitorId: string, emoji: string): Promise<void>;

	abstract getCountsByPostId(postId: string, anonymousVisitorId?: string): Promise<PostReactionCount[]>;

	abstract getCountsByPostIds(
		postIds: string[],
		anonymousVisitorId?: string
	): Promise<Map<string, PostReactionCount[]>>;
}
