import { posts } from '@pif/database';

export class PostCreatedEvent {
	constructor(public readonly post: typeof posts.$inferInsert) {}
}
