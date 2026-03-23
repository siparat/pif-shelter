export enum PaymentWebhookEvent {
	SUBSCRIPTION_SUCCEEDED = 'subscription.succeeded',
	SUBSCRIPTION_FAILED = 'subscription.failed',
	SUBSCRIPTION_CANCELED = 'subscription.canceled',
	PAYMENT_SUCCEEDED = 'payment.succeeded',
	PAYMENT_FAILED = 'payment.failed'
}

export interface IGeneratedPayment {
	url: string;
	amount: number;
}

export interface IOneTimePayment {
	transactionId: string;
	amount: number;
	createdAt: Date;
	paidAt: Date;
}

export interface ISubscription {
	subscription: string;
	period: 'month' | 'year';
	amount: number;
	startDate: Date;
}

export interface ISubscriptionPayment {
	subscriptionId: string;
	amount: number;
	paidAt: Date;
}
