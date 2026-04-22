import { AnimalStatusEnum, AnimalStatusNames } from '@pif/shared';
import { ChevronDown, Loader2 } from 'lucide-react';
import { JSX, useRef, useState } from 'react';
import { AnimalStatusBadge, useCanEditAnimal } from '../../../../entities/animal';
import { statusBadgeColor } from '../../../../entities/animal/model/status-badge.color';
import { cn } from '../../../../shared/lib';
import { QuickStatusAnimal, useQuickStatusChange } from '../../model/use-quick-status-change';
import { StatusMenu } from './StatusMenu';
import { TerminalStatusConfirmModal } from './TerminalStatusConfirmModal';

interface Props {
	animal: QuickStatusAnimal & { curatorId: string | null };
	className?: string;
}

export const AnimalStatusQuickChange = ({ animal, className }: Props): JSX.Element => {
	const canEdit = useCanEditAnimal({ curatorId: animal.curatorId });
	const { requestChange, pendingConfirm, confirm, cancel, isPending } = useQuickStatusChange();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const triggerRef = useRef<HTMLButtonElement | null>(null);

	if (!canEdit) {
		return <AnimalStatusBadge status={animal.status} className={className} />;
	}

	const handleSelect = (nextStatus: AnimalStatusEnum): void => {
		setIsOpen(false);
		requestChange(animal, nextStatus);
	};

	return (
		<div className={cn('relative inline-flex', className)}>
			<button
				type="button"
				ref={triggerRef}
				aria-haspopup="menu"
				aria-expanded={isOpen}
				disabled={isPending}
				onClick={() => setIsOpen((state) => !state)}
				className={cn(
					statusBadgeColor(animal.status),
					'inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-2 py-1 text-xs font-semibold transition-opacity cursor-pointer',
					'hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed'
				)}>
				<span>{AnimalStatusNames[animal.status]}</span>
				{isPending ? (
					<Loader2 size={12} className="animate-spin" />
				) : (
					<ChevronDown size={12} className={cn('transition-transform', isOpen && 'rotate-180')} />
				)}
			</button>
			{isOpen && (
				<StatusMenu
					currentStatus={animal.status}
					onSelect={handleSelect}
					onClose={() => setIsOpen(false)}
					triggerRef={triggerRef}
				/>
			)}
			{pendingConfirm && (
				<TerminalStatusConfirmModal
					nextStatus={pendingConfirm.nextStatus}
					isPending={isPending}
					onConfirm={() => void confirm()}
					onCancel={cancel}
				/>
			)}
		</div>
	);
};
