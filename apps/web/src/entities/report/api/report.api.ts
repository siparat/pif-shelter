import { ListPublicReportsByYearResult, PublicReport } from '@pif/contracts';
import { api } from '../../../shared/api/base';

export const getPublicReportsByYear = async (year: number): Promise<PublicReport[]> => {
	const response = await api.get('reports/public', { searchParams: { year } }).json<ListPublicReportsByYearResult>();
	return response.data;
};
