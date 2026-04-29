import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AlertCircle, ExternalLink, ListChecks, RefreshCw } from 'lucide-react';
import { JSX, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDonationFeedQuery } from '../../../../../entities/donation';
import { ROUTES } from '../../../../../shared/config/routes';
import { cn } from '../../../../../shared/lib/cn';

dayjs.extend(relativeTime);
dayjs.locale('ru');

const formatMinorUnits = (minor: number, currencyRaw: string): string => {
	const code = currencyRaw.length === 3 ? currencyRaw.toUpperCase() : 'RUB';
	const major = minor / 100;
	try {
		return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: code }).format(major);
	} catch {
		return `${major.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${code}`;
	}
};

const donorLabel = (name: string | null | undefined): string => {
	if (name && name.trim().length > 0) {
		return name.trim();
	}
	return 'Анонимно';
};

const commentPreview = (note: string | null, title: string): string => {
	const raw = note && note.trim().length > 0 ? note.trim() : title;
	if (raw.length <= 56) {
		return raw;
	}
	return `${raw.slice(0, 53)}…`;
};

export const DonationsFeedSection = (): JSX.Element => {
	const { rows, isLoading, isError, refetch } = useDonationFeedQuery();

	const rowsWithMeta = useMemo(
		() =>
			rows.map((row) => ({
				...row,
				_displayName: donorLabel(row.donorDisplayName),
				_comment: commentPreview(row.note, row.title),
				_when: dayjs(row.occurredAt).fromNow(),
				_amount: formatMinorUnits(row.netAmount, row.currency)
			})),
		[rows]
	);

	return (
		<section
			className="flex h-full min-w-0 max-w-full flex-col gap-5 rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-4 shadow-[0_12px_36px_rgba(79,61,56,0.1)] sm:p-6 md:p-8"
			aria-labelledby="donations-feed-title">
			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
				<div className="min-w-0 flex-1">
					<h2 id="donations-feed-title" className="text-lg font-bold text-(--color-text-primary) sm:text-xl">
						Недавние пожертвования
					</h2>
					<p className="mt-1 text-sm text-(--color-text-secondary)">
						Из публичной книги: после успешного платежа запись появится в списке.
					</p>
				</div>
				<button
					type="button"
					onClick={() => refetch()}
					className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-(--color-border-soft) bg-(--color-surface-secondary) px-4 text-xs font-bold text-(--color-text-primary) transition-colors hover:bg-(--color-brand-brown-soft) sm:w-auto">
					<RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} aria-hidden />
					Обновить
				</button>
			</div>

			{isError ? (
				<div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-(--color-border-soft) bg-(--color-brand-brown-soft) px-4 py-8 text-center">
					<AlertCircle className="h-8 w-8 text-(--color-brand-accent)" aria-hidden />
					<p className="text-sm font-semibold text-(--color-text-primary)">Не удалось загрузить список</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="rounded-full bg-(--color-brand-brown) px-5 py-2 text-xs font-bold text-(--color-text-on-dark)">
						Повторить
					</button>
				</div>
			) : (
				<>
					<ul className="flex flex-col gap-3 md:hidden" aria-busy={isLoading}>
						{isLoading && rowsWithMeta.length === 0
							? Array.from({ length: 4 }).map((_, i) => (
									<li
										key={`m-skel-${i}`}
										className="h-[88px] animate-pulse rounded-2xl border border-(--color-border-soft) bg-(--color-brand-brown-soft)/50"
									/>
								))
							: null}
						{!isLoading && rowsWithMeta.length === 0 ? (
							<li className="rounded-2xl border border-dashed border-(--color-border-soft) bg-(--color-brand-brown-soft)/40 px-4 py-8 text-center text-sm text-(--color-text-secondary)">
								Пока нет записей — сделайте первое пожертвование в форме выше.
							</li>
						) : null}
						{rowsWithMeta.map((row) => (
							<li
								key={row.id}
								className="rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) px-4 py-3 shadow-sm">
								<div className="flex items-start justify-between gap-2">
									<p className="min-w-0 font-semibold text-(--color-text-primary)">
										{row._displayName}
									</p>
									<p className="shrink-0 tabular-nums text-sm font-bold text-(--color-brand-brown)">
										{row._amount}
									</p>
								</div>
								<p className="mt-1 line-clamp-2 text-sm text-(--color-text-secondary)">
									{row._comment}
								</p>
								<p className="mt-2 text-xs text-(--color-text-secondary)">{row._when}</p>
							</li>
						))}
					</ul>

					<div className="-mx-1 hidden overflow-x-auto pb-1 md:block">
						<table className="min-w-[520px] w-full border-separate border-spacing-0 text-left text-sm">
							<thead>
								<tr className="text-xs font-bold uppercase tracking-wide text-(--color-text-secondary)">
									<th className="pb-3 pr-4">Имя</th>
									<th className="pb-3 pr-4">Сумма</th>
									<th className="pb-3 pr-4">Комментарий</th>
									<th className="pb-3 text-right">Когда</th>
								</tr>
							</thead>
							<tbody className="text-(--color-text-primary)">
								{isLoading && rowsWithMeta.length === 0
									? Array.from({ length: 5 }).map((_, i) => (
											<tr
												key={`skeleton-${i}`}
												className="animate-pulse border-t border-(--color-border-soft)">
												<td className="py-3 pr-4">
													<div className="h-4 w-24 rounded bg-(--color-brand-brown-muted)" />
												</td>
												<td className="py-3 pr-4">
													<div className="h-4 w-20 rounded bg-(--color-brand-brown-muted)" />
												</td>
												<td className="py-3 pr-4">
													<div className="h-4 w-full max-w-[200px] rounded bg-(--color-brand-brown-muted)" />
												</td>
												<td className="py-3 text-right">
													<div className="ml-auto h-4 w-16 rounded bg-(--color-brand-brown-muted)" />
												</td>
											</tr>
										))
									: null}
								{!isLoading && rowsWithMeta.length === 0 ? (
									<tr>
										<td colSpan={4} className="py-10 text-center text-(--color-text-secondary)">
											Пока нет записей — сделайте первое пожертвование в форме слева.
										</td>
									</tr>
								) : null}
								{rowsWithMeta.map((row) => (
									<tr key={row.id} className="border-t border-(--color-border-soft)">
										<td className="py-3 pr-4 font-semibold">{row._displayName}</td>
										<td className="py-3 pr-4 tabular-nums font-bold text-(--color-brand-brown)">
											{row._amount}
										</td>
										<td className="max-w-[200px] py-3 pr-4 text-(--color-text-secondary)">
											{row._comment}
										</td>
										<td className="py-3 text-right text-xs text-(--color-text-secondary)">
											{row._when}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}

			<Link
				to={ROUTES.donationsList}
				className="inline-flex h-12 min-h-12 w-full items-center justify-center gap-2 rounded-full bg-(--color-brand-brown) px-4 text-center text-sm font-bold text-(--color-text-on-dark) transition-transform hover:scale-[1.01] active:scale-[0.99]">
				<ListChecks className="h-5 w-5 shrink-0" aria-hidden />
				<span className="min-w-0 leading-snug sm:whitespace-nowrap">Полный список пожертвований</span>
				<ExternalLink className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
			</Link>
			<p className="text-center text-xs leading-relaxed text-(--color-text-secondary)">
				Имена в отчёте совпадают с тем, что вы указали. Если отметили «анонимно», в таблице будет скрыто.
			</p>
		</section>
	);
};
