export enum GuardianshipStatusEnum {
	ACTIVE = 'ACTIVE',
	CANCELLED = 'CANCELLED',
	PENDING_PAYMENT = 'PENDING_PAYMENT'
}

export const GuardianshipStatusNames: Record<GuardianshipStatusEnum, string> = {
	[GuardianshipStatusEnum.ACTIVE]: 'Активно',
	[GuardianshipStatusEnum.CANCELLED]: 'Отменено',
	[GuardianshipStatusEnum.PENDING_PAYMENT]: 'Ожидает оплаты'
};
