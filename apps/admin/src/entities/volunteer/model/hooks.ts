import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getVolunteers } from '../api/volunteers.api';
import { volunteerSummarySchema } from '@pif/contracts';
import z from 'zod';

export type VolunteerOption = z.infer<typeof volunteerSummarySchema>;

export const useVolunteers = (): UseQueryResult<VolunteerOption[], Error> => {
	return useQuery({
		queryKey: ['volunteers'],
		queryFn: getVolunteers
	});
};
