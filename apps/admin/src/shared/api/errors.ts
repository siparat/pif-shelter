import { apiErrorSchema } from '@pif/contracts';
import { HTTPError } from 'ky';

const DEFAULT_ERROR_MESSAGE = 'Произошла ошибка. Попробуйте снова.';

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
		const parsed = apiErrorSchema.safeParse(error.data);

		if (parsed.success) {
			return parsed.data.error.message;
		}
	} catch (parseError) {
		console.error(parseError);
		if (parseError instanceof Error) {
			return error.message || DEFAULT_ERROR_MESSAGE;
		}
		return DEFAULT_ERROR_MESSAGE;
	}

	return error.message || DEFAULT_ERROR_MESSAGE;
};
