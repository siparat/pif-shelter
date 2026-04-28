import { apiErrorSchema } from '@pif/contracts';
import ky, { HTTPError } from 'ky';
import { API_URL } from '../config/api';

export const api = ky.create({
	prefix: API_URL,
	hooks: {
		beforeError: [
			async ({ error }) => {
				if (!(error instanceof HTTPError)) {
					return error;
				}

				try {
					const parsed = apiErrorSchema.safeParse(error.data);
					if (parsed.success) {
						error.message = parsed.data.error.message;
						return error;
					}

					if (
						typeof error.data === 'object' &&
						error.data !== null &&
						'error' in error.data &&
						typeof error.data.error === 'object' &&
						error.data.error !== null &&
						'message' in error.data.error &&
						typeof error.data.error.message === 'string'
					) {
						error.message = error.data.error.message;
					}
				} catch {
					return error;
				}

				return error;
			}
		]
	}
});
