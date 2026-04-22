import { JSX } from 'react';

interface Props {
	tags: string[] | null;
}

export const AnimalTags = ({ tags }: Props): JSX.Element | null => {
	const items = tags?.filter((tag) => tag.trim().length > 0) ?? [];
	if (items.length === 0) {
		return null;
	}

	return (
		<section className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-3">
			<h2 className="text-xl font-semibold">Характер</h2>
			<ul className="flex flex-wrap gap-2">
				{items.map((tag) => (
					<li
						key={tag}
						className="rounded-full px-3 py-1 text-xs font-medium bg-(--color-bg-primary) border border-(--color-border) text-(--color-text-primary)">
						{tag}
					</li>
				))}
			</ul>
		</section>
	);
};
