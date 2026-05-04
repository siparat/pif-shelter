import {
	AnimalCoatNames,
	AnimalGenderEnum,
	AnimalSizeNames,
	AnimalStatusEnum,
	AnimalStatusNames,
	formatAnimalAge
} from '@pif/shared';
import {
	Cake,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Heart,
	HeartHandshake,
	MapPin,
	PawPrint,
	Scissors,
	ShieldCheck,
	Sparkles,
	Stethoscope,
	Syringe,
	X,
	ZoomIn
} from 'lucide-react';
import { JSX, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AnimalDetails } from '../../../../../entities/animal';
import { MeetingRequestModal, useMeetingRequest } from '../../../../../features/meeting-request';
import { getMediaUrl } from '../../../../../shared/lib/get-media-url';

type AnimalInfoSectionProps = {
	animal: AnimalDetails;
};

const formatBirthDate = (iso: string): string =>
	new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });

const CONFETTI_ITEMS = ['🎉', '🎊', '🥳', '✨', '🎈', '🎁', '⭐', '💫', '🌟', '🎀'];

const RainbowBanner = ({ name, isFemale }: { name: string; isFemale: boolean }): JSX.Element => (
	<div className="relative overflow-hidden rounded-3xl p-6 text-center">
		<div
			className="pointer-events-none absolute inset-0 opacity-15"
			style={{
				background:
					'linear-gradient(135deg, #ff6b6b 0%, #feca57 20%, #48dbfb 40%, #ff9ff3 60%, #54a0ff 80%, #5f27cd 100%)'
			}}
		/>
		<div className="relative flex flex-col items-center gap-3">
			<span className="text-4xl">🌈</span>
			<div>
				<p className="text-lg font-black text-(--color-text-primary)">
					{name} {isFemale ? 'ушла на радугу' : 'ушёл на радугу'}
				</p>
				<p className="mt-1 text-sm leading-relaxed text-(--color-text-secondary)">
					{isFemale ? 'Она' : 'Он'} был{isFemale ? 'а' : ''} частью нашей семьи и навсегда останется в наших
					сердцах. Спи спокойно.
				</p>
			</div>
		</div>
	</div>
);

const AdoptedBanner = ({ name, isFemale }: { name: string; isFemale: boolean }): JSX.Element => {
	const confettiRef = useRef<HTMLDivElement>(null);

	return (
		<div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-50 to-teal-50 p-6 text-center ring-2 ring-emerald-200">
			<div ref={confettiRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
				{CONFETTI_ITEMS.map((emoji, i) => (
					<span
						key={i}
						className="absolute text-xl"
						style={{
							left: `${(i * 10 + 5) % 100}%`,
							top: `${(i * 17 + 10) % 80}%`,
							animation: `float ${2 + (i % 3) * 0.7}s ease-in-out ${(i * 0.3) % 1.5}s infinite alternate`,
							opacity: 0.6
						}}>
						{emoji}
					</span>
				))}
			</div>
			<div className="relative flex flex-col items-center gap-3">
				<span className="text-4xl">🎉</span>
				<div>
					<p className="text-lg font-black text-emerald-800">
						{name} {isFemale ? 'нашла' : 'нашёл'} дом!
					</p>
					<p className="mt-1 text-sm leading-relaxed text-emerald-700">
						{isFemale ? 'Её' : 'Его'} взяли в семью — теперь у {isFemale ? 'неё' : 'него'} есть свой дом,
						любовь и тепло. Спасибо всем, кто помогал!
					</p>
				</div>
				<span className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-700">
					Счастливо живёт в семье 🏠
				</span>
			</div>
		</div>
	);
};

const StatusBadge = ({ status }: { status: AnimalStatusEnum }): JSX.Element | null => {
	if (status === AnimalStatusEnum.ON_TREATMENT) {
		return (
			<div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
				<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
					<Stethoscope className="h-4 w-4 text-amber-600" />
				</span>
				<div>
					<p className="text-sm font-bold text-amber-800">Сейчас на лечении</p>
					<p className="text-xs text-amber-700">
						Временно недоступен для знакомства — проходит лечение. Следите за обновлениями.
					</p>
				</div>
			</div>
		);
	}
	if (status === AnimalStatusEnum.ON_PROBATION) {
		return (
			<div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
				<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
					<Heart className="h-4 w-4 text-blue-600" />
				</span>
				<div>
					<p className="text-sm font-bold text-blue-800">На испытательном сроке</p>
					<p className="text-xs text-blue-700">
						Живёт в семье пробный период. Если всё пройдёт хорошо — скоро официально обретёт дом.
					</p>
				</div>
			</div>
		);
	}
	if (status === AnimalStatusEnum.DRAFT) {
		return (
			<div className="flex items-center gap-3 rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) px-4 py-3">
				<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-surface-primary)">
					<PawPrint className="h-4 w-4 text-(--color-text-secondary)" />
				</span>
				<div>
					<p className="text-sm font-bold text-(--color-text-primary)">Карточка в разработке</p>
					<p className="text-xs text-(--color-text-secondary)">
						Информация ещё уточняется и скоро будет доступна.
					</p>
				</div>
			</div>
		);
	}
	return null;
};

export const AnimalInfoSection = ({ animal }: AnimalInfoSectionProps): JSX.Element => {
	const gallery = [animal.avatarUrl, ...(animal.galleryUrls ?? [])].filter((url): url is string => !!url);
	const [activeImage, setActiveImage] = useState<string>(gallery[0] ?? '');
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const meetingRequest = useMeetingRequest(animal.id);

	const status = animal.status;
	const isPublished = status === AnimalStatusEnum.PUBLISHED;
	const isAdopted = status === AnimalStatusEnum.ADOPTED;
	const isRainbow = status === AnimalStatusEnum.RAINBOW;
	const isOnTreatment = status === AnimalStatusEnum.ON_TREATMENT;
	const isOnProbation = status === AnimalStatusEnum.ON_PROBATION;
	const isUnavailable = isAdopted || isRainbow || isOnTreatment || isOnProbation;
	const canMeet = isPublished;
	const canGuard = isPublished;

	const openLightbox = useCallback(
		(url: string): void => {
			const idx = gallery.indexOf(url);
			setLightboxIndex(idx >= 0 ? idx : 0);
			dialogRef.current?.showModal();
		},
		[gallery]
	);

	const closeLightbox = useCallback((): void => {
		dialogRef.current?.close();
		setLightboxIndex(null);
	}, []);

	const goPrev = useCallback((): void => {
		setLightboxIndex((i) => (i === null ? 0 : (i - 1 + gallery.length) % gallery.length));
	}, [gallery.length]);

	const goNext = useCallback((): void => {
		setLightboxIndex((i) => (i === null ? 0 : (i + 1) % gallery.length));
	}, [gallery.length]);

	const handleDialogKeyDown = useCallback(
		(e: KeyboardEvent<HTMLDialogElement>): void => {
			if (e.key === 'ArrowLeft') goPrev();
			if (e.key === 'ArrowRight') goNext();
		},
		[goPrev, goNext]
	);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		const onClose = (): void => setLightboxIndex(null);
		dialog.addEventListener('close', onClose);
		return () => dialog.removeEventListener('close', onClose);
	}, []);

	const isFemale = animal.gender === AnimalGenderEnum.FEMALE;
	const sizeLabel = AnimalSizeNames[animal.size][animal.gender];
	const coatLabel = AnimalCoatNames[animal.coat];

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

	const openMeetingModal = (): void => {
		if (animal.curatorId == null) {
			toast.error(
				`У ${animal.name} пока нет куратора, вы не сможете встретиться с ${animal.gender == AnimalGenderEnum.FEMALE ? 'ней' : 'ним'} лично`
			);
			return;
		}
		meetingRequest.open();
	};

	return (
		<section className="flex flex-col gap-6">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
				<div className="flex flex-col gap-3">
					<div
						className={`group relative aspect-4/3 overflow-hidden rounded-3xl bg-(--color-brand-brown-soft) shadow-[0_18px_42px_rgba(79,61,56,0.14)] ${isRainbow ? 'grayscale' : ''}`}>
						{activeImage ? (
							<>
								<img
									src={getMediaUrl(activeImage)}
									alt={animal.name}
									className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
								/>
								<button
									type="button"
									onClick={() => openLightbox(activeImage)}
									aria-label="Открыть фото"
									className="absolute inset-0 flex cursor-zoom-in items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
									<span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
										<ZoomIn className="h-5 w-5 text-white" />
									</span>
								</button>
							</>
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
						{!isUnavailable && (
							<span className="absolute right-4 top-4 rounded-full bg-(--color-brand-accent) px-3 py-1 text-[11px] font-bold text-white shadow-sm">
								{AnimalStatusNames[status]}
							</span>
						)}
						{isRainbow && (
							<div
								className="pointer-events-none absolute inset-0 opacity-30"
								style={{
									background:
										'linear-gradient(135deg, rgba(255,107,107,0.6) 0%, rgba(254,202,87,0.6) 25%, rgba(72,219,251,0.6) 50%, rgba(255,159,243,0.6) 75%, rgba(84,160,255,0.6) 100%)'
								}}
							/>
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
										} ${isRainbow ? 'grayscale' : ''}`}>
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
							<MapPin className="h-4 w-4 text-(--color-brand-accent)" />
							{isAdopted || isOnProbation ? 'В семье' : isRainbow ? 'На радуге 🌈' : 'В приюте'} ·{' '}
							{sizeLabel.toLowerCase()} · {formatAnimalAge(animal.birthDate)}
						</p>
					</div>

					{isRainbow && <RainbowBanner name={animal.name} isFemale={isFemale} />}
					{isAdopted && <AdoptedBanner name={animal.name} isFemale={isFemale} />}
					{!isRainbow && !isAdopted && <StatusBadge status={status} />}

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

					{cost && canGuard && (
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

					{(canMeet || canGuard) && (
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							{canMeet && (
								<button
									type="button"
									onClick={openMeetingModal}
									className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-(--color-border-soft) bg-(--color-surface-primary) px-5 text-sm font-bold text-(--color-text-primary) transition-all hover:bg-(--color-surface-secondary) active:scale-[0.985]">
									Хочу {isFemale ? 'её' : 'его'} забрать
								</button>
							)}
							{canGuard && (
								<button
									type="button"
									className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-(--color-brand-accent) px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(254,134,81,0.3)] transition-[transform,filter] hover:brightness-105 active:scale-[0.985]">
									<HeartHandshake className="h-4 w-4" />
									Стать опекуном
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			<dialog
				ref={dialogRef}
				onKeyDown={handleDialogKeyDown}
				className="fixed inset-0 z-200 m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-md">
				{lightboxIndex !== null && gallery[lightboxIndex] && (
					<div
						className="flex h-full w-full items-center justify-center px-4 py-16 sm:px-20"
						onClick={(e) => e.target === e.currentTarget && closeLightbox()}>
						<img
							src={getMediaUrl(gallery[lightboxIndex])}
							alt={`${animal.name} — фото ${lightboxIndex + 1}`}
							className="max-h-full max-w-full rounded-2xl object-contain shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
						/>

						<button
							type="button"
							onClick={closeLightbox}
							aria-label="Закрыть"
							className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:right-6 sm:top-6">
							<X className="h-5 w-5" />
						</button>

						{gallery.length > 1 && (
							<>
								<button
									type="button"
									onClick={goPrev}
									aria-label="Предыдущее фото"
									className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:left-6">
									<ChevronLeft className="h-6 w-6" />
								</button>
								<button
									type="button"
									onClick={goNext}
									aria-label="Следующее фото"
									className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:right-6">
									<ChevronRight className="h-6 w-6" />
								</button>
								<div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
									{gallery.map((_, i) => (
										<button
											key={i}
											type="button"
											onClick={() => setLightboxIndex(i)}
											aria-label={`Фото ${i + 1}`}
											className={`h-1.5 rounded-full transition-all duration-200 ${
												i === lightboxIndex
													? 'w-5 bg-white'
													: 'w-1.5 bg-white/40 hover:bg-white/70'
											}`}
										/>
									))}
								</div>
							</>
						)}
					</div>
				)}
			</dialog>

			<MeetingRequestModal
				open={meetingRequest.isOpen}
				onClose={meetingRequest.close}
				animalName={animal.name}
				form={meetingRequest.form}
				mutation={meetingRequest.mutation}
				step={meetingRequest.step}
				onSubmit={meetingRequest.form.handleSubmit((values) => meetingRequest.mutation.mutate(values))}
			/>
		</section>
	);
};
