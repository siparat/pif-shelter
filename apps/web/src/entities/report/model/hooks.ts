import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getPublicReportsByYear } from '../api/report.api';
import { PublicReport } from '@pif/contracts';

export const reportsQueryKeys = {
	root: ['reports'] as const,
	byYear: (year: number) => [...reportsQueryKeys.root, 'byYear', year] as const
};

export const useReportsByYearQuery = (year: number): UseQueryResult<PublicReport[], Error> =>
	useQuery({
		queryKey: reportsQueryKeys.byYear(year),
		queryFn: () => getPublicReportsByYear(year),
		staleTime: 5 * 60 * 1000
	});
