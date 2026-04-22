import { UserRole } from '@pif/shared';
import { useSession } from '../../session/model/hooks';

export interface AnimalEditableCheckInput {
	curatorId?: string | null;
}

export const canEditAnimal = (
	role: UserRole | undefined,
	userId: string | undefined,
	animal: AnimalEditableCheckInput
): boolean => {
	if (!role || !userId) {
		return false;
	}
	if (role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER) {
		return true;
	}
	if (role === UserRole.VOLUNTEER) {
		return animal.curatorId === userId;
	}
	return false;
};

export const useCanEditAnimal = (animal: AnimalEditableCheckInput): boolean => {
	const { data: session } = useSession();
	return canEditAnimal(session?.user.role as UserRole | undefined, session?.user.id, animal);
};
