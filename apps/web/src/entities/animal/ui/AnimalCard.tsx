import { AnimalGenderEnum, AnimalSizeNames, AnimalStatusEnum, formatAnimalAge } from '@pif/shared';
import { Heart, Mars, PawPrint, Venus } from 'lucide-react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { getMediaUrl } from '../../../shared/lib/get-media-url';
import { AnimalSummary } from '../model/types';

interface AnimalCardProps {
	animal: AnimalSummary;
}

export const AnimalCard = ({ animal }: AnimalCardProps): JSX.Element => {
	const detailsHref = `/animals/${animal.id}`;
	const isFemale = animal.gender === AnimalGenderEnum.FEMALE;
	const GenderIcon = isFemale ? Venus : Mars;

	const subtitleParts = [
		formatAnimalAge(animal.birthDate),
		AnimalSizeNames[animal.size][animal.gender].toLowerCase(),
		animal.color.toLowerCase()
	];

	const healthMarks = [
		{ key: 'vaccinated', label: 'Привит(а)', show: animal.isVaccinated },
		{ key: 'sterilized', label: 'Стерилизован(а)', show: animal.isSterilized },
		{ key: 'parasites', label: 'Без паразитов', show: animal.isParasiteTreated }
	].filter((m) => m.show);

	const cost =
		animal.costOfGuardianship !== null && animal.costOfGuardianship > 0
			? animal.costOfGuardianship.toLocaleString('ru-RU')
			: null;

	return (
		<article className="group relative flex w-full max-w-[360px] flex-col overflow-hidden rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) shadow-[0_8px_24px_rgba(79,61,56,0.08)] transition-shadow duration-200 hover:shadow-[0_16px_32px_rgba(79,61,56,0.14)]">
			<Link
				to={detailsHref}
				className="relative block aspect-4/5 overflow-hidden"
				aria-label={`Карточка ${animal.name}`}>
				{animal.avatarUrl ? (
					<img
						src={getMediaUrl(animal.avatarUrl)}
						alt={animal.name}
						loading="lazy"
						className="absolute inset-0 h-full w-full object-cover"
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center bg-(--color-brand-brown-muted) text-(--color-text-secondary)">
						<PawPrint size={56} strokeWidth={1.4} />
					</div>
				)}

				<div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
					<div className="flex flex-wrap gap-1.5">
						{(animal.labels ?? []).slice(0, 3).map((label) => (
							<span
								key={label.id}
								className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm"
								style={{ backgroundColor: label.color }}>
								{label.name}
							</span>
						))}
					</div>
					{animal.status === AnimalStatusEnum.PUBLISHED && (
						<span className="rounded-full bg-(--color-brand-accent) px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
							Готов к переезду
						</span>
					)}
				</div>
			</Link>

			<div className="flex flex-1 flex-col gap-4 p-5">
				<div className="flex flex-col gap-1">
					<div className="flex items-baseline justify-between gap-2">
						<h3 className="text-[22px] font-bold leading-tight text-(--color-text-primary)">
							{animal.name}
						</h3>
						<GenderIcon
							size={18}
							className={isFemale ? 'text-[#d8366b]' : 'text-[#3aacb4]'}
							aria-label={isFemale ? 'Девочка' : 'Мальчик'}
						/>
					</div>
					<p className="text-[14px] leading-snug text-(--color-text-secondary)">
						{subtitleParts.join(' · ')}
					</p>
				</div>

				{healthMarks.length > 0 && (
					<ul className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-(--color-text-secondary)">
						{healthMarks.map((mark) => (
							<li key={mark.key} className="flex items-center gap-1">
								<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
									<path
										d="M3 8.5l3.5 3.5L13 5"
										stroke="#6aaa5e"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								{mark.label}
							</li>
						))}
					</ul>
				)}

				<div className="mt-auto flex flex-col gap-2 pt-1">
					<Link
						to={detailsHref}
						className="inline-flex h-11 items-center justify-center rounded-full bg-(--color-brand-brown) px-6 text-[14px] font-semibold text-(--color-text-on-dark) transition-[transform,background-color] duration-150 hover:scale-[1.01] hover:bg-(--color-brand-brown-strong)">
						Познакомиться
					</Link>
					{cost && (
						<Link
							to={detailsHref}
							className="group/cost inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-(--color-text-secondary) transition-colors hover:text-(--color-brand-accent)">
							<Heart size={14} className="transition-colors group-hover/cost:fill-current" />
							<p className="mt-0.5">Стать опекуном · {cost} ₽/мес</p>
						</Link>
					)}
				</div>
			</div>
		</article>
	);
};
