import { getAdminDashboardSummaryResponseSchema } from '@pif/contracts';
import z from 'zod';
import { api } from '../../../shared/api';
import { isApiError } from '../../../shared/lib';

type Response = z.infer<typeof getAdminDashboardSummaryResponseSchema>;

export const getDashboardSummary = async (): Promise<Response['data']> => {
	const res = await api.get('admin/dashboard/summary').json<Response>();
	if (isApiError(res)) {
		throw new Error(res.error.message);
	}
	return res.data;
};
