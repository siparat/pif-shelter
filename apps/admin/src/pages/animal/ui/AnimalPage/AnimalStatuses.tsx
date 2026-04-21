import { HTMLAttributes, JSX } from 'react';
import { AnimalItem } from '../../../../entities/animal/model/types';
import { cn } from '../../../../shared/lib';

interface Props extends HTMLAttributes<HTMLDivElement> {
	animal: AnimalItem;
}

export const AnimalStatuses = ({ animal, className, ...props }: Props): JSX.Element => {
	return (
		<div
			className={cn(
				className,
				'rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-3'
			)}
			{...props}>
			<h2 className="text-xl font-semibold">Состояние животного</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
				<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
					<p className="text-(--color-text-secondary)">Стерилизация</p>
					<p className="font-semibold">{animal.isSterilized ? 'Да' : 'Нет'}</p>
				</div>
				<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
					<p className="text-(--color-text-secondary)">Вакцинация</p>
					<p className="font-semibold">{animal.isVaccinated ? 'Да' : 'Нет'}</p>
				</div>
				<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
					<p className="text-(--color-text-secondary)">Обработка от паразитов</p>
					<p className="font-semibold">{animal.isParasiteTreated ? 'Да' : 'Нет'}</p>
				</div>
			</div>
		</div>
	);
};
