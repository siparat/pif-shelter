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
