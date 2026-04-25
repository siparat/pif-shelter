import { apiErrorSchema } from '@pif/contracts';
import { HTTPError } from 'ky';

const DEFAULT_ERROR_MESSAGE = 'Произошла ошибка. Попробуйте снова.';
const TECHNICAL_MESSAGE_PATTERN =
	/(request failed with status code|forbidden:\s*(get|post|patch|put|delete)|https?:\/\/|network error)/i;

const getFallbackMessageByStatus = (status: number): string => {
	if (status === 401) {
		return 'Сессия недействительна. Войдите снова.';
	}
	if (status === 403) {
		return 'Недостаточно прав для выполнения действия.';
	}
	if (status >= 500) {
		return 'Ошибка сервера. Попробуйте позже.';
	}
	return 'Не удалось выполнить запрос. Попробуйте снова.';
};

const normalizeMessage = (message: string | undefined, status?: number): string => {
	if (!message) {
		return status ? getFallbackMessageByStatus(status) : DEFAULT_ERROR_MESSAGE;
	}
	if (TECHNICAL_MESSAGE_PATTERN.test(message)) {
		return status ? getFallbackMessageByStatus(status) : DEFAULT_ERROR_MESSAGE;
	}
	return message;
};

export class UnauthorizedError extends Error {
	constructor(message = 'Сессия недействительна') {
		super(message);
		this.name = 'UnauthorizedError';
	}
}

export const getErrorMessage = async (error: unknown): Promise<string> => {
	if (!(error instanceof HTTPError)) {
		return DEFAULT_ERROR_MESSAGE;
	}

	try {
		const payload = await error.response.clone().json();
		const parsed = apiErrorSchema.safeParse(payload);

		if (parsed.success) {
			return normalizeMessage(parsed.data.error.message, error.response.status);
		}
	} catch (parseError) {
		console.error(parseError);
	}

	return normalizeMessage(error.message, error.response.status);
};
