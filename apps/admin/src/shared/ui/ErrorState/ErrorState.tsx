import { JSX } from 'react';
import { Button } from '../Button/Button';

interface Props {
	title?: string;
	description: string;
	onRetry?: () => void;
}

export const ErrorState = ({ title = 'Не удалось загрузить данные', description, onRetry }: Props): JSX.Element => {
	return (
		<div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-center">
			<h3 className="text-lg font-semibold text-red-500">{title}</h3>
			<p className="mt-2 text-red-500/90">{description}</p>
			{onRetry && (
				<div className="mt-4 flex justify-center">
					<Button type="button" className="mt-0 w-auto px-6 py-2" onClick={onRetry}>
						Повторить
					</Button>
				</div>
			)}
		</div>
	);
};
