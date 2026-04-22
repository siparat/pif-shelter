import { Pencil } from 'lucide-react';
import { JSX, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../shared/config';
import { cn } from '../../../../shared/lib';

interface Props {
	animalId: string;
	description: string | null;
	canEdit: boolean;
}

const COLLAPSE_THRESHOLD = 600;

export const AnimalDescription = ({ animalId, description, canEdit }: Props): JSX.Element => {
	const navigate = useNavigate();
	const [isExpanded, setIsExpanded] = useState<boolean>(false);

	const trimmed = description?.trim() ?? '';
	const isLong = trimmed.length > COLLAPSE_THRESHOLD;

	return (
		<section className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-3">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-xl font-semibold">История</h2>
				{canEdit && trimmed && (
					<button
						type="button"
						className="inline-flex items-center gap-1.5 text-xs text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors"
						onClick={() => navigate(ROUTES.animalEdit.replace(':id', animalId))}>
						<Pencil size={14} />
						Редактировать
					</button>
				)}
			</div>
			{trimmed ? (
				<>
					<p
						className={cn(
							'whitespace-pre-wrap leading-relaxed text-sm md:text-base text-(--color-text-primary)',
							isLong && !isExpanded && 'line-clamp-6'
						)}>
						{trimmed}
					</p>
					{isLong && (
						<button
							type="button"
							aria-expanded={isExpanded}
							onClick={() => setIsExpanded((state) => !state)}
							className="text-sm font-medium text-(--color-brand-orange) hover:underline">
							{isExpanded ? 'Свернуть' : 'Читать полностью'}
						</button>
					)}
				</>
			) : (
				<div className="flex flex-col md:flex-row md:items-center gap-3 text-sm text-(--color-text-secondary)">
					<p>История пока не заполнена.</p>
					{canEdit && (
						<button
							type="button"
							onClick={() => navigate(ROUTES.animalEdit.replace(':id', animalId))}
							className="inline-flex items-center gap-1.5 text-(--color-brand-orange) hover:underline">
							<Pencil size={14} />
							Добавить описание
						</button>
					)}
				</div>
			)}
		</section>
	);
};
