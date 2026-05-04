import { ApiSuccessResponse } from '@pif/contracts';
import { AllowedPostReactionEmoji } from '@pif/shared';
import { api } from '../../../shared/api/base';
import { getAnonymousVisitorId } from '../lib/visitor-id';
import { PostDetails, PostsListParams, PostsListResult } from '../model/types';

const VISITOR_HEADER = 'X-Anonymous-Visitor-Id';

const buildSearchParams = (params: PostsListParams): Record<string, string> => {
	const result: Record<string, string> = {};
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === '') {
			continue;
		}
		result[key] = String(value);
	}
	return result;
};

export const listAnimalPosts = async (params: PostsListParams): Promise<PostsListResult> => {
	return api
		.get('posts', {
			searchParams: buildSearchParams(params),
			headers: { [VISITOR_HEADER]: getAnonymousVisitorId() }
		})
		.json<PostsListResult>();
};

export const getPostById = async (id: string): Promise<PostDetails> => {
	const response = await api
		.get(`posts/${id}`, { headers: { [VISITOR_HEADER]: getAnonymousVisitorId() } })
		.json<ApiSuccessResponse<PostDetails>>();
	return response.data;
};

export const setPostReaction = async (id: string, emoji: AllowedPostReactionEmoji): Promise<void> => {
	await api.patch(`posts/${id}/reaction`, {
		json: { emoji },
		headers: { [VISITOR_HEADER]: getAnonymousVisitorId() }
	});
};
