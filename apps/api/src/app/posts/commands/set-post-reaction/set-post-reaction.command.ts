export class SetPostReactionCommand {
	constructor(
		public readonly postId: string,
		public readonly emoji: string,
		public readonly visitorId: string
	) {}
}
