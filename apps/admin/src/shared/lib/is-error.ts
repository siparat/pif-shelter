import { apiErrorSchema } from '@pif/contracts';
import z from 'zod';

type Error = z.infer<typeof apiErrorSchema>;

export const isApiError = (obj: Error | object): obj is Error => {
	if ('success' in obj && obj.success === false && 'error' in obj) {
		return true;
	}
	return false;
};
