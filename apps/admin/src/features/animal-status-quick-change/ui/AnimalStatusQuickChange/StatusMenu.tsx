import { AnimalStatusEnum, AnimalStatusNames } from '@pif/shared';
import { AlertTriangle, Check } from 'lucide-react';
import { JSX, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { statusBadgeColor } from '../../../../entities/animal/model/status-badge.color';
import { cn } from '../../../../shared/lib';
import { isTerminalStatus } from '../../model/transition-guards';

interface Props {
	currentStatus: AnimalStatusEnum;
	onSelect: (status: AnimalStatusEnum) => void;
	onClose: () => void;
	triggerRef: React.RefObject<HTMLElement | null>;
}

interface MenuPosition {
	top: number;
	left: number;
}

const MENU_MIN_WIDTH = 224;
const MENU_OFFSET = 8;
const VIEWPORT_PADDING = 8;

const STATUSES: AnimalStatusEnum[] = Object.values(AnimalStatusEnum);

export const StatusMenu = ({ currentStatus, onSelect, onClose, triggerRef }: Props): JSX.Element | null => {
	const menuRef = useRef<HTMLDivElement | null>(null);
	const [position, setPosition] = useState<MenuPosition | null>(null);

	useLayoutEffect(() => {
		const computePosition = (): void => {
			const trigger = triggerRef.current;
			if (!trigger) {
				return;
			}
			const rect = trigger.getBoundingClientRect();
			const menuWidth = Math.max(menuRef.current?.offsetWidth ?? 0, MENU_MIN_WIDTH);
			const menuHeight = menuRef.current?.offsetHeight ?? 0;

			let top = rect.bottom + MENU_OFFSET;
			let left = rect.left;

			if (menuHeight > 0 && top + menuHeight > window.innerHeight - VIEWPORT_PADDING) {
				top = Math.max(VIEWPORT_PADDING, rect.top - MENU_OFFSET - menuHeight);
			}
			if (left + menuWidth > window.innerWidth - VIEWPORT_PADDING) {
				left = Math.max(VIEWPORT_PADDING, window.innerWidth - VIEWPORT_PADDING - menuWidth);
			}

			setPosition({ top, left });
		};

		computePosition();
		window.addEventListener('resize', computePosition);
		window.addEventListener('scroll', onClose, true);
		return () => {
			window.removeEventListener('resize', computePosition);
			window.removeEventListener('scroll', onClose, true);
		};
	}, [onClose, triggerRef]);

	useEffect(() => {
		const handleMouseDown = (event: MouseEvent): void => {
			if (!(event.target instanceof Node)) {
				return;
			}
			if (menuRef.current?.contains(event.target)) {
				return;
			}
			if (triggerRef.current?.contains(event.target)) {
				return;
			}
			onClose();
		};

		const handleKeyDown = (event: KeyboardEvent): void => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleMouseDown);
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [onClose, triggerRef]);

	const terminalStatuses = STATUSES.filter(isTerminalStatus);
	const regularStatuses = STATUSES.filter((status) => !isTerminalStatus(status));

	const renderItem = (status: AnimalStatusEnum): JSX.Element => {
		const isCurrent = status === currentStatus;
		return (
			<button
				key={status}
				type="button"
				role="menuitem"
				aria-current={isCurrent}
				onClick={() => onSelect(status)}
				className={cn(
					'flex items-center justify-between gap-3 w-full px-3 py-2.5 text-sm text-left rounded-lg transition-colors',
					'hover:bg-(--color-bg-primary)',
					isCurrent && 'bg-(--color-bg-primary)'
				)}>
				<span className="flex items-center gap-2">
					<span className={cn(statusBadgeColor(status), 'rounded-full px-2 py-0.5 text-xs font-semibold')}>
						{AnimalStatusNames[status]}
					</span>
				</span>
				{isCurrent && <Check size={16} className="text-(--color-brand-orange)" />}
			</button>
		);
	};

	if (typeof document === 'undefined') {
		return null;
	}

	return createPortal(
		<div
			ref={menuRef}
			role="menu"
			style={{
				position: 'fixed',
				top: position?.top ?? -9999,
				left: position?.left ?? -9999,
				minWidth: MENU_MIN_WIDTH,
				visibility: position ? 'visible' : 'hidden'
			}}
			className="z-50 rounded-xl border border-(--color-border) bg-(--color-bg-secondary) shadow-xl p-1.5">
			<div className="flex flex-col gap-0.5">{regularStatuses.map(renderItem)}</div>
			{terminalStatuses.length > 0 && (
				<>
					<div className="my-1.5 h-px bg-(--color-border)" />
					<div className="px-3 pb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-(--color-text-secondary)">
						<AlertTriangle size={12} />
						<span>Терминальные</span>
					</div>
					<div className="flex flex-col gap-0.5">{terminalStatuses.map(renderItem)}</div>
				</>
			)}
		</div>,
		document.body
	);
};
