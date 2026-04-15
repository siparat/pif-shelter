import { apiErrorSchema, getAdminDashboardSummaryResponseSchema } from '@pif/contracts';
import z from 'zod';
import { api } from '../../../shared/api';
import { isApiError } from '../../../shared/lib';

type Response = z.infer<typeof getAdminDashboardSummaryResponseSchema> | z.infer<typeof apiErrorSchema>;
type DashboardSummaryData = z.infer<typeof getAdminDashboardSummaryResponseSchema>['data'];

export const getDashboardSummary = async (): Promise<DashboardSummaryData> => {
	const res = await api.get('admin/dashboard/summary').json<Response>();
	if (isApiError(res)) {
		throw new Error(res.error.message);
	}
	return res.data;
};
