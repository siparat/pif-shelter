import { postMedia } from '@pif/database';
import { PostVisibilityEnum } from '@pif/shared';

export interface ISendAnimalNewPostPayload {
	postId: string;
	animalName: string;
	postTitle: string;
	postBodyHtml: string;
	visibility: PostVisibilityEnum;
	media: (typeof postMedia.$inferSelect)[];
}
