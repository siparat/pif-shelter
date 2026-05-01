import { CampaignStatus } from '@pif/shared';
import { Clock3, HeartHandshake, Sparkles } from 'lucide-react';
import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import { getMediaUrl } from '../../../shared/lib/get-media-url';
import { Campaign } from '../model/types';

type CampaignCardProps = {
	campaign: Campaign;
	onDonateClick: (campaign: Campaign) => void;
};

export const CampaignCard = ({ campaign, onDonateClick }: CampaignCardProps): JSX.Element => {
	const cardRef = useRef<HTMLDivElement | null>(null);
	const [inView, setInView] = useState(false);

	const goalAmountRub = Math.max(0, Math.round((campaign.targetAmount ?? 0) / 100));
	const collectedAmountRub = Math.max(0, Math.round((campaign.collectedAmount ?? 0) / 100));

	const progress = useMemo(() => {
		if (goalAmountRub <= 0) {
			return 0;
		}
		return Math.min(100, Math.round((collectedAmountRub / goalAmountRub) * 100));
	}, [collectedAmountRub, goalAmountRub]);

	useEffect(() => {
		const node = cardRef.current;
		if (!node) {
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry?.isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.2 }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	const leftAmount = Math.max(goalAmountRub - collectedAmountRub, 0);

	return (
		<article
			ref={cardRef}
			className="group relative overflow-hidden rounded-4xl border border-(--color-border-soft) bg-(--color-surface-primary) p-4 shadow-[0_18px_42px_rgba(79,61,56,0.12)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(79,61,56,0.16)] sm:p-5"
			style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)' }}>
			<div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-(--color-brand-accent)/12 blur-2xl" />
			<div className="pointer-events-none absolute -bottom-16 -left-12 h-28 w-28 rounded-full bg-(--color-brand-accent-strong)/20 blur-2xl" />

			<div className="relative z-10 flex items-start gap-3">
				<div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-(--color-border-soft)">
					{campaign.coverImageUrl || campaign.animal?.avatarUrl ? (
						<img
							src={getMediaUrl(campaign.coverImageUrl ?? campaign.animal?.avatarUrl ?? '')}
							alt={campaign.animal?.name ?? campaign.title}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-(--color-brand-brown-soft)">
							<Sparkles className="h-5 w-5 text-(--color-brand-accent)" />
						</div>
					)}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className="rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-(--color-bg-primary)">
							{campaign.status === CampaignStatus.PUBLISHED ? 'Актуальный сбор' : 'В работе'}
						</span>
					</div>
					<h3 className="mt-2 text-lg font-bold text-(--color-text-primary) sm:text-xl">{campaign.title}</h3>
				</div>
			</div>

			<p className="relative z-10 mt-4 text-sm leading-relaxed text-(--color-text-secondary) wrap-break-word">
				{campaign.description ?? 'Сбор открыт для оказания срочной помощи подопечному приюта.'}
			</p>

			{campaign.animal && (
				<Link
					to={ROUTES.animalDetails.replace(':slug', campaign.animal.id)}
					className="hover:brightness-95 transition-colors flex items-center gap-2 mt-2 p-2 bg-(--color-bg-primary) rounded-xl w-fit">
					<div className="w-10 h-10 rounded-full overflow-hidden bg-(--color-bg-primary) border border-(--color-border-soft)">
						<img
							src={getMediaUrl(campaign.animal.avatarUrl ?? '')}
							alt={campaign.animal.name}
							className="w-full h-full object-cover"
						/>
					</div>
					<h3 className="text-sm font-semibold text-(--color-text-primary)">{campaign.animal.name}</h3>
				</Link>
			)}
			<div className="relative z-10 mt-4">
				<div className="mb-2 flex items-center justify-between text-sm font-semibold text-(--color-text-primary)">
					<span>Собрано {collectedAmountRub.toLocaleString('ru-RU')} ₽</span>
					<span>{progress}%</span>
				</div>
				<div className="h-3 overflow-hidden rounded-full bg-(--color-brand-brown-soft)">
					<div
						className="h-full rounded-full bg-(--color-brand-accent) transition-[width] duration-700"
						style={{ width: inView ? `${progress}%` : '0%' }}
					/>
				</div>
				<div className="mt-2 flex items-center justify-between text-xs text-(--color-text-secondary)">
					<span>Цель: {goalAmountRub.toLocaleString('ru-RU')} ₽</span>
					<span>Осталось: {leftAmount.toLocaleString('ru-RU')} ₽</span>
				</div>
			</div>

			<div className="relative z-10 mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-(--color-text-secondary)">
				<span className="inline-flex items-center gap-1.5">
					<Clock3 className="h-3.5 w-3.5 text-(--color-brand-accent)" />
					До {new Date(campaign.endsAt).toLocaleDateString('ru-RU')}
				</span>
			</div>

			<div className="relative z-10 mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
				<button
					type="button"
					onClick={() => onDonateClick(campaign)}
					className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-(--color-brand-accent) px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(254,134,81,0.3)] transition-[transform,filter] hover:brightness-105 active:scale-[0.985]">
					<HeartHandshake className="h-4 w-4" />
					Поддержать сбор
				</button>
			</div>
		</article>
	);
};
