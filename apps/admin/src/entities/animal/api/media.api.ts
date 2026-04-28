import { ApiSuccessResponse, getUploadUrlRequestSchema, getUploadUrlResponseSchema } from '@pif/contracts';
import { z } from 'zod';
import { api } from '../../../shared/api';

export type GetUploadUrlRequest = z.input<typeof getUploadUrlRequestSchema>;
export type GetUploadUrlResponse = ApiSuccessResponse<z.infer<typeof getUploadUrlResponseSchema>['data']>;

export const getUploadUrl = async (payload: GetUploadUrlRequest): Promise<GetUploadUrlResponse> => {
	const searchParams = Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, String(value)]));
	return api.get('media/upload-url', { searchParams }).json<GetUploadUrlResponse>();
};

export const uploadFileToS3 = async (uploadData: GetUploadUrlResponse, file: File): Promise<void> => {
	const formData = new FormData();

	Object.entries(uploadData.data.fields).forEach(([key, value]) => {
		formData.append(key, value);
	});
	formData.append('file', file);

	const response = await fetch(uploadData.data.url, {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		const bodyText = await response.text();
		const tooLarge =
			response.status === 413 ||
			bodyText.includes('<Code>EntityTooLarge</Code>') ||
			bodyText.includes('<Code>MaxMessageLengthExceeded</Code>');

		if (tooLarge) {
			throw new Error('Файл слишком большой для загрузки');
		}

		throw new Error('Не удалось загрузить файл');
	}
};
