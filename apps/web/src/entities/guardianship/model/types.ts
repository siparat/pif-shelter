import { GuardianshipStatusEnum } from '@pif/shared';

export type GuardianshipGuardian = {
	id: string;
	name: string | null;
	email?: string | null;
	avatar?: string | null;
	telegram?: string | null;
	createdAt: string;
};

export type GuardianshipByAnimal = {
	id: string;
	animalId: string;
	status: GuardianshipStatusEnum;
	paidPeriodEndAt: string | null;
	guardian: GuardianshipGuardian;
};
