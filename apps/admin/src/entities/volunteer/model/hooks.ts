import { volunteerSummarySchema } from '@pif/contracts';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import z from 'zod';
import { getVolunteers } from '../api/volunteers.api';

export type VolunteerOption = z.infer<typeof volunteerSummarySchema>;

export const useVolunteers = (): UseQueryResult<VolunteerOption[], Error> => {
	return useQuery({
		queryKey: ['volunteers'],
		queryFn: getVolunteers,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 10,
		refetchOnWindowFocus: false
	});
};
