import {
	createPostRequestSchema,
	createPostResponseSchema,
	listPostsRequestSchema,
	ListPostsResult,
	postResponseSchema
} from '@pif/contracts';
import { z } from 'zod';

export type PostsListParams = z.input<typeof listPostsRequestSchema>;
export type PostsListData = ListPostsResult;
export type PostItem = PostsListData['data'][number];
export type PostDetails = z.infer<typeof postResponseSchema>;

export type CreatePostPayload = z.input<typeof createPostRequestSchema>;
export type CreatePostResponseData = z.infer<typeof createPostResponseSchema>['data'];
