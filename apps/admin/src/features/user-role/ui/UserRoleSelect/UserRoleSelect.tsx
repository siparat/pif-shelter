import { UserRole } from '@pif/shared';
import { Crown, Loader2, Shield, User } from 'lucide-react';
import { JSX } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from '../../../../entities/session/model/hooks';
import { getErrorMessage } from '../../../../shared/api';
import { Select } from '../../../../shared/ui';
import { useSetUserRoleMutation } from '../../model/hooks';

interface Props {
	userId: string;
	currentRole: UserRole;
	className?: string;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
	{ value: UserRole.VOLUNTEER, label: 'Волонтёр' },
	{ value: UserRole.SENIOR_VOLUNTEER, label: 'Старший волонтёр' },
	{ value: UserRole.ADMIN, label: 'Администратор' }
];

const ROLE_ICON: Record<UserRole, JSX.Element> = {
	[UserRole.VOLUNTEER]: <User size={14} />,
	[UserRole.SENIOR_VOLUNTEER]: <Shield size={14} />,
	[UserRole.ADMIN]: <Crown size={14} />,
	[UserRole.GUARDIAN]: <User size={14} />
};

export const UserRoleSelect = ({ userId, currentRole, className }: Props): JSX.Element | null => {
	const { data: session } = useSession();
	const mutation = useSetUserRoleMutation();
	const canManageRoles = session?.user.role === UserRole.ADMIN;
	const isSelf = session?.user.id === userId;

	if (!canManageRoles || isSelf || currentRole === UserRole.GUARDIAN) {
		return null;
	}

	const handleChange = async (nextRole: UserRole): Promise<void> => {
		if (nextRole === currentRole) {
			return;
		}
		try {
			await mutation.mutateAsync({ userId, roleName: nextRole });
			toast.success('Роль обновлена');
		} catch (err) {
			const message = await getErrorMessage(err);
			toast.error(message);
		}
	};

	return (
		<div className={className}>
			<div className="flex items-center gap-2 text-xs text-(--color-text-secondary) mb-2">
				{ROLE_ICON[currentRole]}
				<span>Роль в системе</span>
				{mutation.isPending && <Loader2 size={14} className="animate-spin" />}
			</div>
			<Select<UserRole>
				value={currentRole}
				options={ROLE_OPTIONS}
				small
				disabled={mutation.isPending}
				onChange={(event) => void handleChange(event.target.value as UserRole)}
			/>
		</div>
	);
};
