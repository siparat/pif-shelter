import { UserRole } from '@pif/shared';
import { Heart, Send, Sparkles, User, X } from 'lucide-react';
import { JSX, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { TeamMember } from '../../../entities/team';
import { ROUTES } from '../../../shared/config/routes';
import { cn } from '../../../shared/lib/cn';
import { getMediaUrl } from '../../../shared/lib/get-media-url';

const VOLUNTEER_TELEGRAM_INTRO =
	'Здравствуйте! Хочу узнать про волонтёрство в приюте ПИФ. Подскажите, с чего лучше начать?';

const buildTelegramHref = (telegramRaw: string): string => {
	const username = telegramRaw.replace(/^@/, '').trim();
	return `https://t.me/${username}?text=${encodeURIComponent(VOLUNTEER_TELEGRAM_INTRO)}`;
};

const formatTelegramDisplay = (telegramRaw: string): string => {
	const t = telegramRaw.trim();
	return t.startsWith('@') ? t : `@${t}`;
};

const TelegramGlyph = ({ size = 18 }: { size?: number }): JSX.Element => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
		<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
	</svg>
);

export type VolunteerInviteModalProps = {
	open: boolean;
	onClose: () => void;
	teamMembers: TeamMember[];
};

export const VolunteerInviteModal = ({ open, onClose, teamMembers }: VolunteerInviteModalProps): JSX.Element => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	const admins = useMemo(
		() =>
			teamMembers.filter(
				(m) => m.role === UserRole.ADMIN && typeof m.telegram === 'string' && m.telegram.trim().length > 0
			),
		[teamMembers]
	);

	useEffect(() => {
		const node = dialogRef.current;
		if (!node) {
			return;
		}
		if (open) {
			if (!node.open) {
				node.showModal();
			}
			requestAnimationFrame(() => {
				closeButtonRef.current?.focus();
			});
		} else if (node.open) {
			node.close();
		}
	}, [open]);

	return (
		<dialog
			ref={dialogRef}
			className={cn(
				'fixed inset-0 z-200 m-auto w-[calc(100vw-1.5rem)] max-w-3xl max-h-[min(90dvh,40rem)] overflow-visible rounded-4xl border-0 bg-transparent p-0 shadow-none sm:w-full',
				'backdrop:bg-[rgba(79,61,56,0.48)] backdrop:backdrop-blur-[6px]'
			)}
			aria-labelledby="volunteer-invite-title"
			aria-describedby="volunteer-invite-desc"
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
			onClick={(event) => {
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}>
			<div
				className="relative flex max-h-[min(90dvh,40rem)] flex-col overflow-hidden rounded-4xl border border-(--color-border-soft) bg-(--color-surface-primary) shadow-[0_28px_72px_rgba(79,61,56,0.22)]"
				onClick={(event) => event.stopPropagation()}>
				<div
					className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-(--color-brand-accent)/25 blur-3xl"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute -bottom-16 -left-20 h-44 w-44 rounded-full bg-(--color-brand-accent-strong)/80 blur-3xl"
					aria-hidden
				/>

				<div className="relative flex items-start justify-between gap-3 border-b border-(--color-border-soft) bg-(--color-surface-primary) from-(--color-surface-primary) via-(--color-surface-primary) to-(--color-brand-brown-soft) px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
					<div className="flex min-w-0 flex-col gap-2">
						<span className="eyebrow inline-flex w-fit items-center gap-1.5 text-(--color-brand-accent)">
							<Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
							Присоединяйся
						</span>
						<h2
							id="volunteer-invite-title"
							className="text-xl font-bold tracking-tight text-(--color-text-primary) sm:text-2xl">
							Стань волонтёром приюта
						</h2>
						<p id="volunteer-invite-desc" className="text-sm leading-relaxed text-(--color-text-secondary)">
							Прогулки, корма, транспорт или просто ваше тепло — выберите удобный формат. Напишите любому
							администратору в Telegram: мы ответим и подскажем следующий шаг.
						</p>
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

				<div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
					{admins.length > 0 ? (
						<ul className="flex flex-col gap-3">
							{admins.map((admin) => (
								<li
									key={admin.id}
									className="flex flex-col gap-3 rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
									<div className="flex min-w-0 flex-1 items-center gap-3">
										<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-2 ring-(--color-brand-accent)/35 ring-offset-2 ring-offset-(--color-surface-secondary)">
											{admin.avatar ? (
												<img
													src={getMediaUrl(admin.avatar)}
													alt=""
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center bg-(--color-brand-brown-muted)">
													<User
														className="h-6 w-6 text-(--color-text-secondary)"
														aria-hidden
													/>
												</div>
											)}
										</div>
										<div className="min-w-0">
											<p className="font-bold text-(--color-text-primary)">{admin.name}</p>
											<p className="mt-0.5 text-xs text-(--color-text-secondary)">
												{admin.position}
											</p>
											<p className="mt-1 truncate font-mono text-xs font-semibold text-(--color-brand-brown)">
												{formatTelegramDisplay(admin.telegram)}
											</p>
										</div>
									</div>
									<a
										href={buildTelegramHref(admin.telegram)}
										target="_blank"
										rel="noreferrer"
										className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-(--color-brand-accent) px-4 text-sm font-bold text-white transition-[transform,filter] hover:brightness-105 active:scale-[0.98] sm:h-10 sm:px-5">
										<TelegramGlyph size={17} />
										Написать
										<Send className="h-3.5 w-3.5 opacity-90" aria-hidden />
									</a>
								</li>
							))}
						</ul>
					) : (
						<div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-(--color-border-soft) bg-(--color-brand-brown-soft)/50 px-4 py-10 text-center">
							<Heart className="h-10 w-10 text-(--color-brand-accent)" strokeWidth={1.75} aria-hidden />
							<p className="max-w-xs text-sm font-semibold text-(--color-text-primary)">
								Сейчас не удалось показать контакты администраторов. Загляните в раздел помощи — там
								тоже можно выйти на связь.
							</p>
							<Link
								to={ROUTES.help}
								onClick={onClose}
								className="inline-flex h-11 items-center justify-center rounded-full bg-(--color-brand-brown) px-6 text-sm font-bold text-(--color-text-on-dark)">
								Раздел «Помощь»
							</Link>
						</div>
					)}
				</div>
			</div>
		</dialog>
	);
};
