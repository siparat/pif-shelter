import {
	getPostResponseSchema,
	listPostsRequestSchema,
	ListPostsResult,
	postListItemResponseSchema,
	postResponseSchema
} from '@pif/contracts';
import { z } from 'zod';

export type PostsListParams = z.input<typeof listPostsRequestSchema>;
export type PostsListResult = ListPostsResult;
export type PostListItem = z.infer<typeof postListItemResponseSchema>;
export type PostDetails = z.infer<typeof postResponseSchema>;
export type PostReaction = PostListItem['reactions'][number];
export type GetPostResponse = z.infer<typeof getPostResponseSchema>;
