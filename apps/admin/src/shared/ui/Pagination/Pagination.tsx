import { ChevronLeft, ChevronRight } from 'lucide-react';
import { JSX } from 'react';
import { Button } from '../Button/Button';

interface Props {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onPageChange }: Props): JSX.Element | null => {
	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="flex items-center justify-between gap-3 rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-3">
			<Button
				type="button"
				className="mt-0 w-auto px-4 py-2"
				disabled={page <= 1}
				onClick={() => onPageChange(page - 1)}>
				<ChevronLeft size={16} />
				Назад
			</Button>
			<span className="text-sm text-(--color-text-secondary)">
				Страница {page} из {totalPages}
			</span>
			<Button
				type="button"
				className="mt-0 w-auto px-4 py-2"
				disabled={page >= totalPages}
				onClick={() => onPageChange(page + 1)}>
				Вперед
				<ChevronRight size={16} />
			</Button>
		</div>
	);
};
