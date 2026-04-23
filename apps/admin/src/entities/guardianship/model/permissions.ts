import { UserRole } from '@pif/shared';
import { useSession } from '../../session/model/hooks';

export const canAccessAllGuardianships = (role: UserRole | undefined): boolean => {
	return role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER;
};

export const canCancelGuardianship = (role: UserRole | undefined): boolean => {
	return role === UserRole.ADMIN;
};

export interface GuardianshipReportCheckInput {
	animalCuratorId?: string | null;
}

export const canSendGuardianshipReport = (
	role: UserRole | undefined,
	userId: string | undefined,
	input: GuardianshipReportCheckInput
): boolean => {
	if (!role || !userId) {
		return false;
	}
	if (role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER) {
		return true;
	}
	if (role === UserRole.VOLUNTEER) {
		return input.animalCuratorId === userId;
	}
	return false;
};

export const useCanAccessAllGuardianships = (): boolean => {
	const { data: session } = useSession();
	return canAccessAllGuardianships(session?.user.role as UserRole | undefined);
};

export const useCanCancelGuardianship = (): boolean => {
	const { data: session } = useSession();
	return canCancelGuardianship(session?.user.role as UserRole | undefined);
};

export const useCanSendGuardianshipReport = (input: GuardianshipReportCheckInput): boolean => {
	const { data: session } = useSession();
	return canSendGuardianshipReport(session?.user.role as UserRole | undefined, session?.user.id, input);
};
