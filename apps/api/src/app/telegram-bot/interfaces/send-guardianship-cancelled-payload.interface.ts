export interface ISendGuardianshipCancelledPayload {
	animalName: string;
	reason: string;
	isRefundExpected: boolean;
}

export interface IGuardianshipCancelledMessagePayload extends ISendGuardianshipCancelledPayload {
	adminTelegramUsername: string;
}
