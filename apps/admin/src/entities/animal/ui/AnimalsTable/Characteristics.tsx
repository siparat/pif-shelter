import { JSX } from 'react';
import { cn } from '../../../../shared/lib';
import { AnimalItem } from '../../model/types';

interface Props {
	animal: AnimalItem;
}

export const Characteristics = ({ animal }: Props): JSX.Element => {
	return (
		<div className="text-(--color-text-secondary) flex flex-col gap-1">
			<div className="flex items-center gap-1">
				<span
					className={cn(
						animal.isVaccinated ? 'bg-green-400' : 'bg-red-400',
						'inline-block rounded-full h-1.5 w-1.5'
					)}
				/>
				<p>Привит: {animal.isVaccinated ? 'Да' : 'Нет'}</p>
			</div>{' '}
			<div className="flex items-center gap-1">
				<span
					className={cn(
						animal.isSterilized ? 'bg-green-400' : 'bg-red-400',
						'inline-block rounded-full h-1.5 w-1.5'
					)}
				/>
				<p>Стерилизован: {animal.isSterilized ? 'Да' : 'Нет'}</p>
			</div>{' '}
			<div className="flex items-center gap-1">
				<span
					className={cn(
						animal.isParasiteTreated ? 'bg-green-400' : 'bg-red-400',
						'inline-block rounded-full h-1.5 w-1.5'
					)}
				/>
				<p>Обработка от паразитов: {animal.isParasiteTreated ? 'Да' : 'Нет'}</p>
			</div>{' '}
		</div>
	);
};
