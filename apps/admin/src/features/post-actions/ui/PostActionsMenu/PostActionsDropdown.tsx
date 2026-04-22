import { Pencil, Trash2 } from 'lucide-react';
import { JSX, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../../shared/lib';

interface Props {
	onEdit: () => void;
	onDelete: () => void;
	onClose: () => void;
	triggerRef: React.RefObject<HTMLElement | null>;
}

interface MenuPosition {
	top: number;
	left: number;
}

const MENU_MIN_WIDTH = 180;
const MENU_OFFSET = 6;
const VIEWPORT_PADDING = 8;

export const PostActionsDropdown = ({ onEdit, onDelete, onClose, triggerRef }: Props): JSX.Element | null => {
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
			let left = rect.right - menuWidth;

			if (menuHeight > 0 && top + menuHeight > window.innerHeight - VIEWPORT_PADDING) {
				top = Math.max(VIEWPORT_PADDING, rect.top - MENU_OFFSET - menuHeight);
			}
			if (left < VIEWPORT_PADDING) {
				left = VIEWPORT_PADDING;
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
			if (!(event.target instanceof Node)) return;
			if (menuRef.current?.contains(event.target)) return;
			if (triggerRef.current?.contains(event.target)) return;
			onClose();
		};
		const handleKeyDown = (event: KeyboardEvent): void => {
			if (event.key === 'Escape') onClose();
		};
		document.addEventListener('mousedown', handleMouseDown);
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [onClose, triggerRef]);

	if (typeof document === 'undefined') return null;

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
			<div className="flex flex-col gap-0.5">
				<button
					type="button"
					role="menuitem"
					onClick={onEdit}
					className={cn(
						'flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded-lg transition-colors',
						'hover:bg-(--color-bg-primary)'
					)}>
					<Pencil size={14} />
					Редактировать
				</button>
				<button
					type="button"
					role="menuitem"
					onClick={onDelete}
					className={cn(
						'flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded-lg transition-colors text-red-500',
						'hover:bg-red-500/10'
					)}>
					<Trash2 size={14} />
					Удалить
				</button>
			</div>
		</div>,
		document.body
	);
};
