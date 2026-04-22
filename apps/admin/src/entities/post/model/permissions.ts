import { UserRole } from '@pif/shared';
import { useSession } from '../../session/model/hooks';

export interface PostEditableCheckInput {
	authorId: string | null | undefined;
}

export interface PostCreatableCheckInput {
	curatorId: string | null | undefined;
}

export const canEditPost = (
	role: UserRole | undefined,
	userId: string | undefined,
	post: PostEditableCheckInput
): boolean => {
	if (!role || !userId) {
		return false;
	}
	if (role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER) {
		return true;
	}
	if (role === UserRole.VOLUNTEER) {
		return post.authorId === userId;
	}
	return false;
};

export const canCreatePost = (
	role: UserRole | undefined,
	userId: string | undefined,
	animal: PostCreatableCheckInput
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

export const useCanEditPost = (post: PostEditableCheckInput): boolean => {
	const { data: session } = useSession();
	return canEditPost(session?.user.role as UserRole | undefined, session?.user.id, post);
};

export const useCanCreatePost = (animal: PostCreatableCheckInput): boolean => {
	const { data: session } = useSession();
	return canCreatePost(session?.user.role as UserRole | undefined, session?.user.id, animal);
};
