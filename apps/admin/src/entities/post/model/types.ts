import { listPostsRequestSchema, ListPostsResult, postResponseSchema } from '@pif/contracts';
import { z } from 'zod';

export type PostsListParams = z.input<typeof listPostsRequestSchema>;
export type PostsListData = ListPostsResult;
export type PostItem = PostsListData['data'][number];
export type PostDetails = z.infer<typeof postResponseSchema>;
