import { ApiSuccessResponse } from '@pif/contracts';
import { api } from '../../../shared/api';
import { CreatePostPayload, CreatePostResponseData, PostDetails, PostsListData, PostsListParams } from '../model/types';

const buildSearchParams = (params: PostsListParams): Record<string, string> => {
	const rawEntries = Object.entries(params).filter(
		([, value]) => value !== undefined && value !== null && value !== ''
	);
	return Object.fromEntries(rawEntries.map(([key, value]) => [key, String(value)]));
};

export const getPosts = async (params: PostsListParams): Promise<PostsListData> => {
	return api.get('posts', { searchParams: buildSearchParams(params) }).json<PostsListData>();
};

export const getPostById = async (id: string): Promise<PostDetails> => {
	return (await api.get(`posts/${id}`).json<ApiSuccessResponse<PostDetails>>()).data;
};

export const createPost = async (payload: CreatePostPayload): Promise<CreatePostResponseData> => {
	const response = await api.post('posts', { json: payload }).json<ApiSuccessResponse<CreatePostResponseData>>();
	return response.data;
};
