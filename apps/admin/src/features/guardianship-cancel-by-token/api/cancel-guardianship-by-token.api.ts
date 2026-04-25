import { cancelGuardianshipByTokenResponseSchema } from '@pif/contracts';
import { api } from '../../../shared/api';
import { z } from 'zod';

type CancelGuardianshipByTokenResult = z.infer<typeof cancelGuardianshipByTokenResponseSchema>;

export interface CancelGuardianshipByTokenPayload {
	token: string;
}

export const cancelGuardianshipByToken = async (
	payload: CancelGuardianshipByTokenPayload
): Promise<CancelGuardianshipByTokenResult['data']> => {
	const response = await api
		.post('guardianships/cancel-by-token', { json: payload })
		.json<CancelGuardianshipByTokenResult>();
	return response.data;
};
