import { AnimalCoatNames, AnimalGenderEnum, AnimalSizeNames, AnimalStatusEnum, formatAnimalAge } from '@pif/shared';
import {
	Cake,
	Calendar,
	HeartHandshake,
	MapPin,
	PawPrint,
	Scissors,
	ShieldCheck,
	Sparkles,
	Syringe
} from 'lucide-react';
import { JSX, useState } from 'react';
import { AnimalDetails } from '../../../../../entities/animal';
import { getMediaUrl } from '../../../../../shared/lib/get-media-url';

type AnimalInfoSectionProps = {
	animal: AnimalDetails;
};

const formatBirthDate = (iso: string): string =>
	new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });

export const AnimalInfoSection = ({ animal }: AnimalInfoSectionProps): JSX.Element => {
	const gallery = [animal.avatarUrl, ...(animal.galleryUrls ?? [])].filter((url): url is string => !!url);
	const [activeImage, setActiveImage] = useState<string>(gallery[0] ?? '');

	const isFemale = animal.gender === AnimalGenderEnum.FEMALE;
	const sizeLabel = AnimalSizeNames[animal.size][animal.gender];
	const coatLabel = AnimalCoatNames[animal.coat];
	const isPublished = animal.status === AnimalStatusEnum.PUBLISHED;

	const characteristics = [
		{ icon: PawPrint, label: 'Пол', value: isFemale ? 'Девочка' : 'Мальчик' },
		{ icon: Cake, label: 'Возраст', value: formatAnimalAge(animal.birthDate) },
		{ icon: Calendar, label: 'Дата рождения', value: formatBirthDate(animal.birthDate) },
		{ icon: Sparkles, label: 'Размер', value: sizeLabel },
		{ icon: PawPrint, label: 'Шерсть', value: coatLabel },
		{ icon: PawPrint, label: 'Окрас', value: animal.color }
	];

	const healthMarks = [
		{ icon: Syringe, label: 'Привит(а)', show: animal.isVaccinated },
		{ icon: Scissors, label: 'Стерилизован(а)', show: animal.isSterilized },
		{ icon: ShieldCheck, label: 'Без паразитов', show: animal.isParasiteTreated }
	].filter((m) => m.show);

	const cost =
		animal.costOfGuardianship !== null && animal.costOfGuardianship > 0
			? animal.costOfGuardianship.toLocaleString('ru-RU')
			: null;

	return (
		<section className="flex flex-col gap-6">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
				<div className="flex flex-col gap-3">
					<div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-(--color-brand-brown-soft) shadow-[0_18px_42px_rgba(79,61,56,0.14)]">
						{activeImage ? (
							<img
								src={getMediaUrl(activeImage)}
								alt={animal.name}
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-(--color-text-secondary)">
								<PawPrint size={64} strokeWidth={1.4} />
							</div>
						)}
						<div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
							{(animal.labels ?? []).map((label) => (
								<span
									key={label.id}
									className="rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm"
									style={{ backgroundColor: label.color }}>
									{label.name}
								</span>
							))}
						</div>
						{isPublished && (
							<span className="absolute right-4 top-4 rounded-full bg-(--color-brand-accent) px-3 py-1 text-[11px] font-bold text-white shadow-sm">
								Готов(а) к переезду
							</span>
						)}
					</div>

					{gallery.length > 1 && (
						<div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
							{gallery.map((url) => {
								const isActive = url === activeImage;
								return (
									<button
										key={url}
										type="button"
										onClick={() => setActiveImage(url)}
										className={`relative aspect-square h-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all sm:h-24 ${
											isActive
												? 'border-(--color-brand-accent) opacity-100'
												: 'border-transparent opacity-70 hover:opacity-100'
										}`}>
										<img
											src={getMediaUrl(url)}
											alt=""
											className="h-full w-full object-cover"
											loading="lazy"
										/>
									</button>
								);
							})}
						</div>
					)}
				</div>

				<div className="flex flex-col gap-5">
					<div>
						<h1 className="text-3xl font-black uppercase leading-tight text-(--color-text-primary) md:text-4xl">
							{animal.name}
						</h1>
						<p className="mt-2 inline-flex items-center gap-2 text-sm text-(--color-text-secondary)">
							<MapPin className="h-4 w-4 text-(--color-brand-accent)" />В приюте ·{' '}
							{sizeLabel.toLowerCase()} · {formatAnimalAge(animal.birthDate)}
						</p>
					</div>

					{animal.description && (
						<p className="whitespace-pre-line text-sm leading-relaxed text-(--color-text-secondary) md:text-base">
							{animal.description}
						</p>
					)}

					{(animal.tags ?? []).length > 0 && (
						<div className="flex flex-wrap gap-2">
							{animal.tags?.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-(--color-border-soft) bg-(--color-surface-secondary) px-3 py-1 text-xs font-semibold text-(--color-text-secondary)">
									#{tag}
								</span>
							))}
						</div>
					)}

					<div className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-5">
						<h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-(--color-text-secondary)">
							Карточка питомца
						</h2>
						<dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							{characteristics.map(({ icon: Icon, label, value }) => (
								<div key={label} className="flex items-start gap-3">
									<Icon className="mt-0.5 h-4 w-4 shrink-0 text-(--color-brand-accent)" />
									<div className="flex min-w-0 flex-1 items-baseline justify-between gap-2 border-b border-dashed border-(--color-border-soft) pb-2">
										<dt className="text-sm text-(--color-text-secondary)">{label}</dt>
										<dd className="text-sm font-semibold text-(--color-text-primary)">{value}</dd>
									</div>
								</div>
							))}
						</dl>

						{healthMarks.length > 0 && (
							<ul className="mt-4 flex flex-wrap gap-2">
								{healthMarks.map(({ icon: Icon, label }) => (
									<li
										key={label}
										className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
										<Icon className="h-3.5 w-3.5" />
										{label}
									</li>
								))}
							</ul>
						)}
					</div>

					{cost && (
						<div className="rounded-3xl bg-linear-to-br from-(--color-brand-accent) to-[#ff6f3a] p-5 text-white shadow-[0_18px_36px_rgba(254,134,81,0.32)]">
							<div className="flex items-baseline justify-between gap-3">
								<span className="text-sm font-semibold opacity-90">Сумма опекунства</span>
								<HeartHandshake className="h-5 w-5 opacity-90" />
							</div>
							<p className="mt-2 text-3xl font-black md:text-4xl">
								{cost} ₽<span className="text-base font-semibold opacity-80"> / мес</span>
							</p>
							<p className="mt-1 text-xs opacity-90">
								Хватает на корм, лекарства и плановый уход за {isFemale ? 'девочкой' : 'мальчиком'}
							</p>
						</div>
					)}

					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<button
							type="button"
							className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-(--color-border-soft) bg-(--color-surface-primary) px-5 text-sm font-bold text-(--color-text-primary) transition-all hover:bg-(--color-surface-secondary) active:scale-[0.985]">
							Хочу его {isFemale ? 'забрать' : 'забрать'}
						</button>
						<button
							type="button"
							className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-(--color-brand-accent) px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(254,134,81,0.3)] transition-[transform,filter] hover:brightness-105 active:scale-[0.985]">
							<HeartHandshake className="h-4 w-4" />
							Стать опекуном
						</button>
					</div>
				</div>
			</div>
		</section>
	);
};
