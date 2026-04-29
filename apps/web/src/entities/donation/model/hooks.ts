import { donationAmountKopecksSchema } from '@pif/contracts';
import { LedgerEntryDirectionEnum, LedgerEntrySourceEnum } from '@pif/shared';
import { useQueries, useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { z } from 'zod';
import { createDonationSubscription, createOneTimeDonation, getPublicMonthlyLedger } from '../api/donation.api';
import {
	DEFAULT_DONATION_AMOUNT_KOPECKS,
	DONATION_FEED_PREVIEW_LIMIT,
	DONATION_PRESET_AMOUNTS_KOPECKS
} from '../constants';
import type { CreateDonationSubscriptionRequest, CreateOneTimeDonationRequest, PublicLedgerReportRow } from './types';

export { DEFAULT_DONATION_AMOUNT_KOPECKS, DONATION_FEED_PREVIEW_LIMIT, DONATION_PRESET_AMOUNTS_KOPECKS };

export const donationQueryKeys = {
	root: ['donations'] as const,
	publicLedger: (year: number, month: number) => [...donationQueryKeys.root, 'public-ledger', year, month] as const
};

const getUtcYearMonth = (d: Date): { year: number; month: number } => ({
	year: d.getUTCFullYear(),
	month: d.getUTCMonth() + 1
});

const prevMonth = (year: number, month: number): { year: number; month: number } =>
	month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };

export const useDonationFeedQuery = (): {
	rows: PublicLedgerReportRow[];
	isLoading: boolean;
	isError: boolean;
	refetch: () => void;
} => {
	const queryClient = useQueryClient();
	const { year: cy, month: cm } = useMemo(() => getUtcYearMonth(new Date()), []);
	const { year: py, month: pm } = useMemo(() => prevMonth(cy, cm), [cy, cm]);

	const results = useQueries({
		queries: [
			{
				queryKey: donationQueryKeys.publicLedger(cy, cm),
				queryFn: () => getPublicMonthlyLedger({ year: cy, month: cm }),
				staleTime: 60 * 1000
			},
			{
				queryKey: donationQueryKeys.publicLedger(py, pm),
				queryFn: () => getPublicMonthlyLedger({ year: py, month: pm }),
				staleTime: 60 * 1000
			}
		]
	});

	const [currentQuery, previousQuery] = results;

	const rows = useMemo(() => {
		const merged = [...(currentQuery.data ?? []), ...(previousQuery.data ?? [])];
		const donationIncomes = merged.filter(
			(e) =>
				e.direction === LedgerEntryDirectionEnum.INCOME &&
				(e.source === LedgerEntrySourceEnum.DONATION_ONE_OFF ||
					e.source === LedgerEntrySourceEnum.DONATION_SUBSCRIPTION)
		);
		return [...donationIncomes].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
	}, [currentQuery.data, previousQuery.data]);

	const visible = useMemo(() => rows.slice(0, DONATION_FEED_PREVIEW_LIMIT), [rows]);

	return {
		rows: visible,
		isLoading: results.some((r) => r.isLoading),
		isError: results.some((r) => r.isError),
		refetch: () => {
			void queryClient.invalidateQueries({ queryKey: donationQueryKeys.root });
		}
	};
};

export const useCreateOneTimeDonationMutation = (): UseMutationResult<
	{ paymentUrl: string; transactionId: string },
	Error,
	CreateOneTimeDonationRequest
> =>
	useMutation({
		mutationFn: createOneTimeDonation
	});

export const useCreateDonationSubscriptionMutation = (): UseMutationResult<
	{ paymentUrl: string; subscriptionId: string },
	Error,
	CreateDonationSubscriptionRequest
> =>
	useMutation({
		mutationFn: createDonationSubscription
	});

export const parseDonationAmountKopecks = (value: unknown): z.SafeParseReturnType<number, number> =>
	donationAmountKopecksSchema.safeParse(value);
