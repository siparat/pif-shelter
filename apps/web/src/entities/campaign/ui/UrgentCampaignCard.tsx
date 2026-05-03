import { HeartHandshake, Sparkles } from 'lucide-react';
import { CSSProperties, JSX, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../shared/config/routes';
import { getMediaUrl } from '../../../shared/lib/get-media-url';
import { Campaign } from '../model/types';

interface UrgentCampaignCardProps {
	campaign: Campaign;
	delay: number;
	featured?: boolean;
	onDetailClick: (campaign: Campaign) => void;
	onDonateClick: (campaign: Campaign) => void;
}

export const UrgentCampaignCard = ({
	campaign,
	delay,
	featured = false,
	onDetailClick,
	onDonateClick
}: UrgentCampaignCardProps): JSX.Element => {
	const cardRef = useRef<HTMLElement>(null);
	const [inView, setInView] = useState(false);
	const [progressVisible, setProgressVisible] = useState(false);

	useEffect(() => {
		const node = cardRef.current;
		if (!node) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!inView) return;
		const t = setTimeout(() => setProgressVisible(true), delay + 400);
		return () => clearTimeout(t);
	}, [inView, delay]);

	const goalRub = Math.max(0, Math.round((campaign.targetAmount ?? 0) / 100));
	const collectedRub = Math.max(0, Math.round((campaign.collectedAmount ?? 0) / 100));
	const leftRub = Math.max(goalRub - collectedRub, 0);
	const progress = useMemo(() => {
		if (goalRub <= 0) return 0;
		return Math.min(100, Math.round((collectedRub / goalRub) * 100));
	}, [collectedRub, goalRub]);

	const coverUrl = campaign.coverImageUrl ?? campaign.animal?.avatarUrl;

	const cardStyle: CSSProperties = {
		opacity: inView ? 1 : 0,
		transform: inView ? 'translateY(0) scale(1)' : 'translateY(48px) scale(0.97)',
		transition: `opacity 0.75s cubic-bezier(0.34, 1.3, 0.64, 1) ${delay}ms, transform 0.75s cubic-bezier(0.34, 1.3, 0.64, 1) ${delay}ms`
	};

	return (
		<article
			ref={cardRef}
			style={cardStyle}
			className={`group relative flex flex-col overflow-hidden rounded-[32px] bg-(--color-surface-primary) border border-(--color-border-soft) shadow-(--color-card-shadow) hover:shadow-[0_24px_56px_rgba(79,61,56,0.18)] transition-shadow duration-500 cursor-pointer ${featured ? 'md:col-span-2' : ''}`}
			onClick={() => onDetailClick(campaign)}>
			<div className={`relative overflow-hidden ${featured ? 'h-72' : 'h-56'} shrink-0`}>
				{coverUrl ? (
					<img
						src={getMediaUrl(coverUrl)}
						alt={campaign.animal?.name ?? campaign.title}
						className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
					/>
				) : (
					<div className="w-full h-full bg-(--color-brand-brown-soft) flex items-center justify-center">
						<Sparkles className="w-12 h-12 text-(--color-brand-accent)" />
					</div>
				)}

				<div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />

				<div className="absolute top-4 left-4 flex items-center gap-1.5 bg-(--color-brand-accent) text-(--color-text-inverse) text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
					<span className="w-2 h-2 rounded-full bg-(--color-text-inverse) animate-ping opacity-75 absolute" />
					<span className="w-2 h-2 rounded-full bg-(--color-text-inverse) relative" />
					Срочный сбор
				</div>

				{campaign.animal && (
					<Link
						to={ROUTES.animalDetails.replace(':slug', campaign.animal.id)}
						className="absolute bottom-4 left-4 flex items-center gap-2 bg-(--color-surface-primary)/90 backdrop-blur-sm rounded-full pl-1 pr-3 py-1 hover:bg-(--color-surface-primary) transition-colors shadow-md"
						onClick={(e) => e.stopPropagation()}>
						<div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
							<img
								src={getMediaUrl(campaign.animal.avatarUrl ?? '')}
								alt={campaign.animal.name}
								className="w-full h-full object-cover"
							/>
						</div>
						<span className="text-sm font-semibold text-(--color-text-primary)">
							{campaign.animal.name}
						</span>
					</Link>
				)}
			</div>

			<div className="flex flex-col flex-1 p-6 gap-4">
				<div>
					<h3
						className={`font-bold text-(--color-text-primary) leading-tight mb-2 ${featured ? 'text-2xl' : 'text-xl'}`}>
						{campaign.title}
					</h3>
					{campaign.description && (
						<p className="text-(--color-text-secondary) text-base leading-relaxed line-clamp-3">
							{campaign.description}
						</p>
					)}
				</div>

				<div className="mt-auto">
					<div className="flex justify-between items-baseline mb-2">
						<span className="text-lg font-bold text-(--color-text-primary)">
							{collectedRub.toLocaleString('ru-RU')} ₽
						</span>
						<span className="text-base text-(--color-text-secondary)">
							из {goalRub.toLocaleString('ru-RU')} ₽
						</span>
					</div>
					<div className="h-3 rounded-full bg-(--color-brand-brown-soft) overflow-hidden">
						<div
							className="h-full rounded-full bg-(--color-brand-accent) transition-[width] duration-1000 ease-out"
							style={{ width: progressVisible ? `${progress}%` : '0%' }}
						/>
					</div>
					<div className="flex justify-between mt-2">
						<span className="text-base font-semibold text-(--color-brand-accent)">{progress}% собрано</span>
						<span className="text-base text-(--color-text-secondary)">
							осталось {leftRub.toLocaleString('ru-RU')} ₽
						</span>
					</div>
				</div>

				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onDonateClick(campaign);
					}}
					className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--color-brand-accent) hover:brightness-105 active:scale-[0.98] py-4 text-base font-bold text-(--color-text-inverse) shadow-[0_8px_24px_rgba(254,134,81,0.30)] transition-[transform,filter]">
					<HeartHandshake className="w-5 h-5" />
					Помочь{campaign.animal ? ` ${campaign.animal.name}` : ' сейчас'}
				</button>
			</div>
		</article>
	);
};
