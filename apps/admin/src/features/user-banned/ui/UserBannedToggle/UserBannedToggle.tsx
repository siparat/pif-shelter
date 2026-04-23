import { UserRole } from '@pif/shared';
import { Ban, Loader2, ShieldCheck } from 'lucide-react';
import { JSX } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from '../../../../entities/session/model/hooks';
import { getErrorMessage } from '../../../../shared/api';
import { cn } from '../../../../shared/lib';
import { useSetUserBannedMutation } from '../../model/hooks';

interface Props {
	userId: string;
	banned: boolean;
	targetRole: UserRole;
	variant?: 'user' | 'guardian';
	className?: string;
}

const LABELS: Record<NonNullable<Props['variant']>, { block: string; unblock: string }> = {
	user: {
		block: 'Заблокировать вход',
		unblock: 'Разблокировать вход'
	},
	guardian: {
		block: 'Заблокировать опекуна',
		unblock: 'Разблокировать опекуна'
	}
};

export const UserBannedToggle = ({
	userId,
	banned,
	targetRole,
	variant = 'user',
	className
}: Props): JSX.Element | null => {
	const { data: session } = useSession();
	const mutation = useSetUserBannedMutation();
	const role = session?.user.role as UserRole | undefined;
	const canUse = role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER;
	const cannotActOnTargetAdmin = targetRole === UserRole.ADMIN && role === UserRole.SENIOR_VOLUNTEER;
	const isSelf = session?.user.id === userId;
	if (!canUse || cannotActOnTargetAdmin || isSelf) {
		return null;
	}
	const labels = LABELS[variant] ?? LABELS.user;

	const handleClick = async (): Promise<void> => {
		const next = !banned;
		try {
			await mutation.mutateAsync({ userId, banned: next });
			toast.success(next ? 'Пользователь заблокирован' : 'Блокировка снята');
		} catch (err) {
			const message = await getErrorMessage(err);
			toast.error(message);
		}
	};

	return (
		<button
			type="button"
			onClick={() => void handleClick()}
			disabled={mutation.isPending}
			className={cn(
				'inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors',
				banned
					? 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'
					: 'border-red-500/40 text-red-300 hover:bg-red-500/10',
				mutation.isPending && 'opacity-60 cursor-wait',
				className
			)}
			title={banned ? 'Снять блокировку входа в систему' : 'Запретить вход (Better Auth)'}>
			{mutation.isPending ? (
				<Loader2 size={14} className="animate-spin" />
			) : banned ? (
				<ShieldCheck size={14} />
			) : (
				<Ban size={14} />
			)}
			{banned ? labels.unblock : labels.block}
		</button>
	);
};
