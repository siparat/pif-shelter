import { X } from 'lucide-react';
import { JSX, MouseEvent, PropsWithChildren, useEffect } from 'react';

interface Props extends PropsWithChildren {
	title: string;
	onClose: () => void;
}

export const Modal = ({ title, onClose, children }: Props): JSX.Element => {
	const closeByOverlay = (e: MouseEvent): void => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const handleKeyDown = (e: KeyboardEvent): void => {
		if (e.key === 'Escape') {
			onClose();
		}
	};

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = 'auto';
		};
	}, []);

	return (
		<div
			onClick={closeByOverlay}
			className="fixed inset-0 z-60 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4">
			<div className="modal-scroll w-full max-h-[92vh] md:max-h-[90vh] md:max-w-4xl overflow-auto rounded-t-3xl md:rounded-3xl bg-(--color-bg-secondary) border border-(--color-border)">
				<div className="sticky top-0 z-10 flex items-center justify-between border-b border-(--color-border) bg-(--color-bg-secondary) px-4 py-3 md:px-6">
					<h2 className="text-lg md:text-xl font-semibold">{title}</h2>
					<button
						type="button"
						className="rounded-lg p-2 hover:bg-(--color-bg-primary)"
						aria-label="Закрыть"
						title="Закрыть"
						onClick={onClose}>
						<X size={18} />
					</button>
				</div>
				<div className="p-4 md:p-6">{children}</div>
			</div>
		</div>
	);
};
