import { JSX } from 'react';
import { Button } from '../Button/Button';

interface Props {
	title: string;
	description: string;
	actionLabel?: string;
	onAction?: () => void;
}

export const EmptyState = ({ title, description, actionLabel, onAction }: Props): JSX.Element => {
	return (
		<div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-bg-secondary) p-8 text-center">
			<h3 className="text-lg font-semibold">{title}</h3>
			<p className="mt-2 text-(--color-text-secondary)">{description}</p>
			{actionLabel && onAction && (
				<div className="mt-4 flex justify-center">
					<Button type="button" className="mt-0 w-auto px-6 py-2" onClick={onAction}>
						{actionLabel}
					</Button>
				</div>
			)}
		</div>
	);
};
