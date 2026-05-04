import {
	paymentWebhookRequestSchema,
	paymentWebhookResponseSchema,
	startGuardianshipAuthenticatedRequestSchema,
	startGuardianshipRequestSchema,
	startGuardianshipResponseSchema,
	type PaymentWebhookResponse
} from '@pif/contracts';
import { PaymentWebhookEvent } from '@pif/shared';
import { api } from '../../../shared/api/base';
import { GuardianshipByAnimal } from '../model/types';

export const getGuardianshipByAnimal = async (animalId: string): Promise<GuardianshipByAnimal | null> => {
	try {
		const body = await api.get(`guardianships/by-animal/${animalId}`).json<{ data: GuardianshipByAnimal }>();
		return body.data;
	} catch (error) {
		const status = (error as { response?: { status?: number } }).response?.status;
		if (status === 404) {
			return null;
		}
		throw error;
	}
};

export type GuardianshipRequestPayload = {
	animalId: string;
	name: string;
	email: string;
	telegramUsername?: string;
};

export type GuardianshipWebhookConfirmationData = PaymentWebhookResponse['data'];

export const startGuardianshipRequest = async (
	payload: GuardianshipRequestPayload
): Promise<{
	guardianshipId: string;
	paymentUrl: string;
	cancellationToken: string;
}> => {
	const parsedPayload = startGuardianshipRequestSchema.parse(payload);
	const body = await api.post('guardianships', { json: parsedPayload }).json();
	return startGuardianshipResponseSchema.parse(body).data;
};

export const startAuthenticatedGuardianshipRequest = async (
	animalId: string
): Promise<{
	guardianshipId: string;
	paymentUrl: string;
	cancellationToken: string;
}> => {
	const parsedPayload = startGuardianshipAuthenticatedRequestSchema.parse({ animalId });
	const body = await api.post('guardianships/authenticated', { json: parsedPayload }).json();
	return startGuardianshipResponseSchema.parse(body).data;
};

export type SignInPayload = { email: string; password: string };

export const signInEmail = async (payload: SignInPayload): Promise<void> => {
	await api.post('auth/sign-in/email', { json: payload });
};

export const confirmGuardianshipViaPaymentWebhook = async (params: {
	subscriptionId: string;
	amountKopecks: number;
}): Promise<GuardianshipWebhookConfirmationData> => {
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
	const body = await api.post('payments/webhooks/guardianship', { json: payload }).json();
	return paymentWebhookResponseSchema.parse(body).data;
};
