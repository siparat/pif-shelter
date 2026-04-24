import { CampaignStatus } from '@pif/shared';
import { CalendarClock, ImageIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { JSX, useEffect, useRef, useState } from 'react';
import { CampaignItem } from '../../../../entities/campaign';
import { cn } from '../../../../shared/lib';
import {
	ANIMAL_STATUS_LABEL,
	formatDate,
	formatMoney,
	resolvePublicMediaUrl,
	STATUS_COLOR,
	STATUS_LABEL
} from './utils';

interface Props {
	item: CampaignItem;
	isChangingStatus: boolean;
	isDeleting: boolean;
	onEdit: () => void;
	onDelete: () => void;
	onChangeStatus: (status: CampaignStatus) => void;
}

const getLeftDaysColor = (daysLeft: number): string => {
	if (daysLeft <= 3) {
		return '#ef4444';
	}
	if (daysLeft <= 7) {
		return '#f97316';
	}
	return '#22c55e';
};

export const CampaignCard = ({
	item,
	isChangingStatus,
	isDeleting,
	onEdit,
	onDelete,
	onChangeStatus
}: Props): JSX.Element => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handler = (event: MouseEvent): void => {
			if (!(event.target instanceof Node)) {
				return;
			}
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setIsMenuOpen(false);
			}
		};
		window.addEventListener('mousedown', handler);
		return () => window.removeEventListener('mousedown', handler);
	}, []);

	const target = item.targetAmount ?? 0;
	const collected = item.collectedAmount ?? 0;
	const progress = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0;

	const now = Date.now();
	const endsAtMs = new Date(item.endsAt).getTime();
	const daysLeft = Math.ceil((endsAtMs - now) / (1000 * 60 * 60 * 24));
	const isExpired = endsAtMs < now;

	const coverSrc = resolvePublicMediaUrl(item.coverImageUrl ?? undefined);
	const animalAvatarSrc = item.animal ? resolvePublicMediaUrl(item.animal.avatarUrl ?? undefined) : undefined;

	return (
		<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) overflow-hidden flex flex-col">
			<div className="relative aspect-video bg-(--color-bg-primary)">
				{coverSrc ? (
					<img src={coverSrc} alt={item.title} className="w-full h-full object-cover max-h-60" />
				) : (
					<div className="w-full h-full flex items-center justify-center text-(--color-text-secondary)">
						<ImageIcon size={40} />
					</div>
				)}
				<span
					style={{ background: STATUS_COLOR[item.status] }}
					className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow">
					{STATUS_LABEL[item.status]}
				</span>
				<div className="absolute top-2 right-2" ref={menuRef}>
					<button
						type="button"
						onClick={() => setIsMenuOpen((prev) => !prev)}
						className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70"
						aria-label="Действия">
						<MoreVertical size={16} />
					</button>
					{isMenuOpen && (
						<div className="absolute right-0 mt-1 w-56 rounded-xl border border-(--color-border) bg-(--color-bg-secondary) shadow-xl overflow-hidden z-10">
							<p className="px-3 py-2 text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wide border-b border-(--color-border)">
								Статус
							</p>
							{Object.values(CampaignStatus)
								.filter(
									(status) => status !== CampaignStatus.SUCCESS && status !== CampaignStatus.FAILED
								)
								.map((status) => (
									<button
										key={status}
										type="button"
										disabled={isChangingStatus || item.status === status}
										onClick={() => {
											onChangeStatus(status);
											setIsMenuOpen(false);
										}}
										className={cn(
											'flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-(--color-bg-primary) disabled:opacity-60 disabled:cursor-not-allowed',
											item.status === status && 'bg-(--color-bg-primary) font-semibold'
										)}>
										<span
											className="w-2 h-2 rounded-full"
											style={{ background: STATUS_COLOR[status] }}
										/>
										{STATUS_LABEL[status]}
									</button>
								))}
						</div>
					)}
				</div>
			</div>

			<div className="p-4 flex flex-col gap-3 flex-1">
				<h3 className="text-base font-semibold text-(--color-text-primary) line-clamp-2">{item.title}</h3>

				{item.animal ? (
					<div className="flex items-center gap-2 text-sm">
						<div className="w-7 h-7 rounded-full overflow-hidden bg-(--color-bg-primary) border border-(--color-border) flex items-center justify-center shrink-0">
							{animalAvatarSrc ? (
								<img
									src={animalAvatarSrc}
									alt={item.animal.name}
									className="w-full h-full object-cover"
								/>
							) : (
								<span className="text-xs">{item.animal.name.charAt(0).toUpperCase()}</span>
							)}
						</div>
						<div className="flex flex-col min-w-0">
							<span className="truncate font-medium">{item.animal.name}</span>
							<span className="truncate text-xs text-(--color-text-secondary)">
								{ANIMAL_STATUS_LABEL[item.animal.status]}
							</span>
						</div>
					</div>
				) : (
					<p className="text-sm text-(--color-text-secondary)">Без привязки к животному</p>
				)}

				<div className="space-y-1.5">
					<div className="flex items-baseline justify-between gap-2 text-sm">
						<span className="font-semibold text-(--color-text-primary)">{formatMoney(collected)}</span>
						<span className="text-xs text-(--color-text-secondary)">из {formatMoney(target)}</span>
					</div>
					<div className="h-2 rounded-full bg-(--color-bg-primary) overflow-hidden">
						<div
							className="h-full bg-(--color-brand-orange) transition-all"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<p className="text-xs text-(--color-text-secondary)">{progress}% собрано</p>
				</div>

				<div className="flex items-center gap-2 text-xs text-(--color-text-secondary)">
					<CalendarClock size={14} />
					<span>
						{formatDate(item.endsAt)}
						{!isExpired && daysLeft >= 0 && (
							<>
								{' '}
								· осталось <span style={{ color: getLeftDaysColor(daysLeft) }}>{daysLeft}</span> дн.
							</>
						)}
						{isExpired && ' · истёк'}
					</span>
				</div>

				<div className="flex gap-2 mt-auto pt-2">
					<button
						type="button"
						onClick={onEdit}
						className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-(--color-border) bg-(--color-bg-primary) px-3 py-2 text-sm font-semibold hover:bg-(--color-bg-secondary) transition-colors">
						<Pencil size={14} />
						Редактировать
					</button>
					<button
						type="button"
						onClick={onDelete}
						disabled={isDeleting}
						className="flex items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10 text-red-500 px-3 py-2 hover:bg-red-500/20 transition-colors disabled:opacity-60"
						aria-label="Удалить">
						<Trash2 size={14} />
					</button>
				</div>
			</div>
		</div>
	);
};
