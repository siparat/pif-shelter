import { AnimalCoatNames, AnimalSizeNames, formatAnimalAge } from '@pif/shared';
import dayjs from 'dayjs';
import { JSX } from 'react';
import { AnimalDetails } from '../../../../entities/animal/model/types';

interface Props {
	animal: AnimalDetails;
}

interface Row {
	label: string;
	value: string;
}

export const AnimalCharacteristics = ({ animal }: Props): JSX.Element => {
	const rows: Row[] = [
		{ label: 'Возраст', value: formatAnimalAge(animal.birthDate) },
		{ label: 'Дата рождения', value: dayjs(animal.birthDate).format('DD.MM.YYYY') },
		{ label: 'Размер', value: AnimalSizeNames[animal.size][animal.gender] },
		{ label: 'Шерсть', value: AnimalCoatNames[animal.coat] },
		{ label: 'Окрас', value: animal.color }
	];

	return (
		<section className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-3">
			<h2 className="text-xl font-semibold">Характеристики</h2>
			<dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
				{rows.map((row) => (
					<div
						key={row.label}
						className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
						<dt className="text-(--color-text-secondary)">{row.label}</dt>
						<dd className="mt-1 font-semibold text-(--color-text-primary) wrap-break-words">{row.value}</dd>
					</div>
				))}
			</dl>
		</section>
	);
};
