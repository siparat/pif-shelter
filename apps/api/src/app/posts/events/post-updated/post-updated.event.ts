import { posts } from '@pif/database';

export class PostUpdatedEvent {
	constructor(public readonly post: typeof posts.$inferInsert) {}
}
