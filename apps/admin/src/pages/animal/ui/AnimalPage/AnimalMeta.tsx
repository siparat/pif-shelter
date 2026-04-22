import dayjs from 'dayjs';
import { JSX } from 'react';

interface Props {
	createdAt: string;
	updatedAt: string;
}

export const AnimalMeta = ({ createdAt, updatedAt }: Props): JSX.Element => {
	return (
		<p className="text-xs text-(--color-text-secondary) text-center">
			Добавлено {dayjs(createdAt).format('DD.MM.YYYY')} · Обновлено {dayjs(updatedAt).format('DD.MM.YYYY HH:mm')}
		</p>
	);
};
