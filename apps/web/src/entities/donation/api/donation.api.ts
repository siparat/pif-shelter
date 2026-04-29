import {
	cancelDonationSubscriptionByTokenRequestSchema,
	cancelDonationSubscriptionByTokenResponseSchema,
	createDonationSubscriptionRequestSchema,
	createDonationSubscriptionResponseSchema,
	createOneTimeDonationRequestSchema,
	createOneTimeDonationResponseSchema,
	paymentWebhookRequestSchema,
	paymentWebhookResponseSchema,
	publicLedgerReportResponseSchema,
	type PaymentWebhookResponse
} from '@pif/contracts';
import { PaymentWebhookEvent } from '@pif/shared';
import type {
	CreateDonationSubscriptionRequest,
	CreateOneTimeDonationRequest,
	PublicLedgerReportQuery,
	PublicLedgerReportRow
} from '../model/types';
import { api } from '../../../shared/api/base';

const buildSearchParams = (q: PublicLedgerReportQuery): Record<string, string> => ({
	year: String(q.year),
	month: String(q.month)
});

export const getPublicMonthlyLedger = async (query: PublicLedgerReportQuery): Promise<PublicLedgerReportRow[]> => {
	const body = await api.get('finance/public/monthly-ledger', { searchParams: buildSearchParams(query) }).json();
	return publicLedgerReportResponseSchema.parse(body).data;
};

export const createOneTimeDonation = async (
	payload: CreateOneTimeDonationRequest
): Promise<{ paymentUrl: string; transactionId: string }> => {
	const parsedPayload = createOneTimeDonationRequestSchema.parse(payload);
	const body = await api.post('donations/one-time', { json: parsedPayload }).json();
	return createOneTimeDonationResponseSchema.parse(body).data;
};

export const createDonationSubscription = async (
	payload: CreateDonationSubscriptionRequest
): Promise<{ paymentUrl: string; subscriptionId: string }> => {
	const parsedPayload = createDonationSubscriptionRequestSchema.parse(payload);
	const body = await api.post('donations/subscription', { json: parsedPayload }).json();
	return createDonationSubscriptionResponseSchema.parse(body).data;
};

export type DonationWebhookConfirmationData = PaymentWebhookResponse['data'];

export const confirmDonationOneTimeViaPaymentWebhook = async (params: {
	transactionId: string;
	amountKopecks: number;
}): Promise<DonationWebhookConfirmationData> => {
	const feeAmount = 0;
	const grossAmount = params.amountKopecks;
	const netAmount = grossAmount - feeAmount;
	const payload = paymentWebhookRequestSchema.parse({
		event: PaymentWebhookEvent.PAYMENT_SUCCEEDED,
		transactionId: params.transactionId,
		providerPaymentId: crypto.randomUUID(),
		grossAmount,
		feeAmount,
		netAmount,
		paidAt: new Date().toISOString()
	});
	const body = await api.post('payments/webhooks/donations/one-time', { json: payload }).json();
	return paymentWebhookResponseSchema.parse(body).data;
};

export const confirmDonationSubscriptionViaPaymentWebhook = async (params: {
	subscriptionId: string;
	amountKopecks: number;
}): Promise<DonationWebhookConfirmationData> => {
	const feeAmount = 0;
	const grossAmount = params.amountKopecks;
	const netAmount = grossAmount - feeAmount;
	const payload = paymentWebhookRequestSchema.parse({
		event: PaymentWebhookEvent.SUBSCRIPTION_SUCCEEDED,
		subscriptionId: params.subscriptionId,
		providerPaymentId: crypto.randomUUID(),
		grossAmount,
		feeAmount,
		netAmount,
		paidAt: new Date().toISOString()
	});
	const body = await api.post('payments/webhooks/donations/subscription', { json: payload }).json();
	return paymentWebhookResponseSchema.parse(body).data;
};

export const cancelDonationSubscriptionByToken = async (token: string): Promise<{ subscriptionId: string }> => {
	const payload = cancelDonationSubscriptionByTokenRequestSchema.parse({ token });
	const body = await api.post('donations/subscription/cancel-by-token', { json: payload }).json();
	return cancelDonationSubscriptionByTokenResponseSchema.parse(body).data;
};
