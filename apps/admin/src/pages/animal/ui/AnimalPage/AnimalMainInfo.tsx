import { AnimalGenderNames, AnimalSpeciesNames, formatAnimalAge } from '@pif/shared';
import { HTMLAttributes, JSX } from 'react';
import { AnimalItem } from '../../../../entities/animal/model/types';
import { AnimalAvatar } from '../../../../entities/animal/ui/AnimalAvatar/AnimalAvatar';
import { AnimalStatusQuickChange } from '../../../../features/animal-status-quick-change';
import { cn } from '../../../../shared/lib';
import { Badge } from '../../../../shared/ui';

interface Props extends HTMLAttributes<HTMLDivElement> {
	animal: AnimalItem;
	curatorName: string;
}

export const AnimalMainInfo = ({ animal, curatorName, className, ...props }: Props): JSX.Element => {
	return (
		<div
			className={cn(className, 'rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6')}
			{...props}>
			<div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
				<div className="flex items-center gap-4">
					<AnimalAvatar animal={animal} width={96} height={96} rounded />
					<div>
						<p className="text-xl font-semibold">{animal.name}</p>
						<div className="mt-1">
							<AnimalStatusQuickChange
								animal={{
									id: animal.id,
									status: animal.status,
									avatarUrl: animal.avatarUrl,
									curatorId: animal.curatorId
								}}
							/>
						</div>
						<p className="mt-2 text-sm text-(--color-text-secondary)">
							{AnimalSpeciesNames[animal.species]} · {AnimalGenderNames[animal.gender]} ·{' '}
							{formatAnimalAge(animal.birthDate)}
						</p>
					</div>
				</div>
				<div className="text-sm text-(--color-text-secondary) space-y-1">
					<p>
						Куратор: <span className="text-(--color-text-primary)">{curatorName ?? 'Не назначен'}</span>
					</p>
					<p>
						Стоимость опекунства:{' '}
						<span className="text-(--color-text-primary)">
							{animal.costOfGuardianship ? `${animal.costOfGuardianship} ₽` : 'Не задана'}
						</span>
					</p>
				</div>
			</div>
			{(animal.labels?.length || undefined) && (
				<div className="flex flex-wrap gap-1.5 mt-4">
					{animal.labels?.map((label) => (
						<Badge key={label.id} color={label.color}>
							{label.name}
						</Badge>
					))}
				</div>
			)}
		</div>
	);
};
