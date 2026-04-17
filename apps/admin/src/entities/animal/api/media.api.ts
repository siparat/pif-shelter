import { getUploadUrlRequestSchema, getUploadUrlResponseSchema } from '@pif/contracts';
import { z } from 'zod';
import { api } from '../../../shared/api';

export type GetUploadUrlRequest = z.input<typeof getUploadUrlRequestSchema>;
export type GetUploadUrlResponse = z.infer<typeof getUploadUrlResponseSchema>['data'];

export const getUploadUrl = async (payload: GetUploadUrlRequest): Promise<GetUploadUrlResponse> => {
	const searchParams = Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, String(value)]));
	return api.get('media/upload-url', { searchParams }).json<GetUploadUrlResponse>();
};

export const uploadFileToS3 = async (uploadData: GetUploadUrlResponse, file: File): Promise<void> => {
	const formData = new FormData();

	Object.entries(uploadData.fields).forEach(([key, value]) => {
		formData.append(key, value);
	});
	formData.append('file', file);

	const response = await fetch(uploadData.url, {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		throw new Error('Не удалось загрузить файл');
	}
};
