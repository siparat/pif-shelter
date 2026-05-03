import { HeartHandshake, Sparkles, X } from 'lucide-react';
import { JSX, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Campaign } from '../../../entities/campaign';
import { ROUTES } from '../../../shared/config/routes';
import { cn } from '../../../shared/lib/cn';
import { getMediaUrl } from '../../../shared/lib/get-media-url';

type CampaignDetailModalProps = {
	campaign: Campaign | null;
	open: boolean;
	onClose: () => void;
	onDonateClick: (campaign: Campaign) => void;
};

export const CampaignDetailModal = ({
	campaign,
	open,
	onClose,
	onDonateClick
}: CampaignDetailModalProps): JSX.Element => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	const goalRub = Math.max(0, Math.round((campaign?.targetAmount ?? 0) / 100));
	const collectedRub = Math.max(0, Math.round((campaign?.collectedAmount ?? 0) / 100));
	const leftRub = Math.max(goalRub - collectedRub, 0);
	const progress = useMemo(() => {
		if (goalRub <= 0) return 0;
		return Math.min(100, Math.round((collectedRub / goalRub) * 100));
	}, [collectedRub, goalRub]);

	useEffect(() => {
		const node = dialogRef.current;
		if (!node) return;
		if (open) {
			if (!node.open) node.showModal();
			requestAnimationFrame(() => closeButtonRef.current?.focus());
		} else if (node.open) {
			node.close();
		}
	}, [open]);

	const coverUrl = campaign?.coverImageUrl ?? campaign?.animal?.avatarUrl;

	return (
		<dialog
			ref={dialogRef}
			className={cn(
				'fixed inset-0 z-200 m-auto w-[calc(100vw-1.5rem)] max-w-xl max-h-[min(90dvh,44rem)] overflow-visible rounded-4xl border-0 bg-transparent p-0 shadow-none sm:w-full',
				'backdrop:bg-[rgba(79,61,56,0.48)] backdrop:backdrop-blur-[6px]'
			)}
			aria-labelledby="campaign-detail-title"
			onCancel={(e) => {
				e.preventDefault();
				onClose();
			}}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}>
			<div
				className="relative flex max-h-[min(90dvh,44rem)] flex-col overflow-hidden rounded-4xl border border-(--color-border-soft) bg-(--color-surface-primary) shadow-[0_28px_72px_rgba(79,61,56,0.22)]"
				onClick={(e) => e.stopPropagation()}>
				<div
					className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-(--color-brand-accent)/20 blur-3xl"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute -bottom-16 -left-20 h-44 w-44 rounded-full bg-(--color-brand-accent-strong)/60 blur-3xl"
					aria-hidden
				/>

				<div className="relative flex items-start justify-between gap-3 border-b border-(--color-border-soft) bg-(--color-surface-primary) px-5 pb-4 pt-5 sm:px-6 sm:pt-6 shrink-0">
					<div className="flex min-w-0 flex-col gap-2">
						<span className="eyebrow inline-flex w-fit items-center gap-1.5 text-(--color-brand-accent)">
							<Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
							Срочный сбор
						</span>
						<h2
							id="campaign-detail-title"
							className="text-xl font-bold tracking-tight text-(--color-text-primary) sm:text-2xl leading-tight">
							{campaign?.title ?? ''}
						</h2>
						{campaign?.animal && (
							<Link
								to={ROUTES.animalDetails.replace(':slug', campaign.animal.id)}
								onClick={onClose}
								className="inline-flex w-fit items-center gap-2 rounded-full bg-(--color-brand-brown-soft) pl-1.5 pr-4 py-1.5 hover:bg-(--color-brand-brown-muted) transition-colors mt-1">
								<div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-(--color-brand-accent)/30">
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
					<button
						ref={closeButtonRef}
						type="button"
						onClick={onClose}
						className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--color-border-soft) bg-(--color-surface-secondary) text-(--color-text-primary) transition-colors hover:bg-(--color-brand-brown-soft)"
						aria-label="Закрыть">
						<X className="h-5 w-5" strokeWidth={2.2} aria-hidden />
					</button>
				</div>

				<div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 flex flex-col gap-5">
					{coverUrl && (
						<div className="relative h-52 overflow-hidden rounded-2xl shrink-0">
							<img
								src={getMediaUrl(coverUrl)}
								alt={campaign?.animal?.name ?? campaign?.title}
								className="w-full h-full object-cover"
							/>
						</div>
					)}

					{campaign?.description && (
						<p className="text-base leading-relaxed text-(--color-text-primary) wrap-break-word">
							{campaign.description}
						</p>
					)}

					{goalRub > 0 && (
						<div className="rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) p-4 flex flex-col gap-3">
							<div className="flex justify-between items-baseline">
								<span className="text-xl font-bold text-(--color-text-primary)">
									{collectedRub.toLocaleString('ru-RU')} ₽
								</span>
								<span className="text-base text-(--color-text-secondary)">
									из {goalRub.toLocaleString('ru-RU')} ₽
								</span>
							</div>
							<div className="h-3 rounded-full bg-(--color-brand-brown-soft) overflow-hidden">
								<div
									className="h-full rounded-full bg-(--color-brand-accent)"
									style={{ width: `${progress}%` }}
								/>
							</div>
							<div className="flex justify-between">
								<span className="text-base font-semibold text-(--color-brand-accent)">
									{progress}% собрано
								</span>
								<span className="text-base text-(--color-text-secondary)">
									осталось {leftRub.toLocaleString('ru-RU')} ₽
								</span>
							</div>
						</div>
					)}

					<button
						type="button"
						onClick={() => {
							if (campaign) {
								onClose();
								onDonateClick(campaign);
							}
						}}
						className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--color-brand-accent) hover:brightness-105 active:scale-[0.98] py-4 text-base font-bold text-(--color-text-inverse) shadow-[0_12px_24px_rgba(254,134,81,0.3)] transition-[transform,filter]">
						<HeartHandshake className="w-5 h-5" aria-hidden />
						Помочь{campaign?.animal ? ` ${campaign.animal.name}` : ' сейчас'}
					</button>
				</div>
			</div>
		</dialog>
	);
};
