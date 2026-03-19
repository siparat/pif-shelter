import { posts } from '@pif/database';

export class TelegramNewPostJob {
	constructor(public readonly post: typeof posts.$inferInsert) {}
}
