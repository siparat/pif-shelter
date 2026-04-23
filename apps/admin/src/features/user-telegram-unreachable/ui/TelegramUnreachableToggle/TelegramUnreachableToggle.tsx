import { UserRole } from '@pif/shared';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { JSX } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from '../../../../entities/session/model/hooks';
import { getErrorMessage } from '../../../../shared/api';
import { cn } from '../../../../shared/lib';
import { useSetTelegramUnreachableMutation } from '../../model/hooks';

interface Props {
	userId: string;
	isUnreachable: boolean;
	className?: string;
}

export const TelegramUnreachableToggle = ({ userId, isUnreachable, className }: Props): JSX.Element | null => {
	const { data: session } = useSession();
	const mutation = useSetTelegramUnreachableMutation();

	const role = session?.user.role as UserRole | undefined;
	const canToggle = role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER;
	if (!canToggle) {
		return null;
	}

	const handleClick = async (): Promise<void> => {
		const next = !isUnreachable;
		try {
			await mutation.mutateAsync({ userId, unreachable: next });
			toast.success(next ? 'Отмечено: Telegram недоступен' : 'Флаг недоступности Telegram снят');
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
				isUnreachable
					? 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'
					: 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10',
				mutation.isPending && 'opacity-60 cursor-wait',
				className
			)}
			title={
				isUnreachable
					? 'Снять отметку — Telegram снова считается доступным'
					: 'Пометить, что Telegram недоступен — уведомления перестанут отправляться'
			}>
			{mutation.isPending ? (
				<Loader2 size={14} className="animate-spin" />
			) : isUnreachable ? (
				<CheckCircle2 size={14} />
			) : (
				<AlertTriangle size={14} />
			)}
			{isUnreachable ? 'Снять флаг недоступности' : 'Пометить Telegram недоступным'}
		</button>
	);
};
