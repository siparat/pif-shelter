import { JSX } from 'react';

interface SectionPlaceholderProps {
	title: string;
	description?: string;
}

export const SectionPlaceholder = ({
	title,
	description = 'Раздел в разработке'
}: SectionPlaceholderProps): JSX.Element => {
	return (
		<div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl p-6">
			<h1 className="text-2xl font-bold mb-2">{title}</h1>
			<p className="text-(--color-text-secondary)">{description}</p>
		</div>
	);
};
