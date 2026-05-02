import { LedgerEntrySourceEnum } from '@pif/shared';
import { CalendarDays, Gem, Search, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { useDonationLedgerQuery } from '../../../../entities/donation';
import { StatCard } from '../../../../shared/ui';

const MONTH_OPTIONS = [
	{ value: 1, label: 'Январь' },
	{ value: 2, label: 'Февраль' },
	{ value: 3, label: 'Март' },
	{ value: 4, label: 'Апрель' },
	{ value: 5, label: 'Май' },
	{ value: 6, label: 'Июнь' },
	{ value: 7, label: 'Июль' },
	{ value: 8, label: 'Август' },
	{ value: 9, label: 'Сентябрь' },
	{ value: 10, label: 'Октябрь' },
	{ value: 11, label: 'Ноябрь' },
	{ value: 12, label: 'Декабрь' }
] as const;

const currentDate = new Date();
const CURRENT_YEAR = currentDate.getUTCFullYear();
const CURRENT_MONTH = currentDate.getUTCMonth() + 1;
const START_YEAR = 2021;
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, index) => CURRENT_YEAR - index);

const sourceLabels: Record<LedgerEntrySourceEnum, string> = {
	[LedgerEntrySourceEnum.DONATION_ONE_OFF]: 'Разовый',
	[LedgerEntrySourceEnum.DONATION_SUBSCRIPTION]: 'Подписка',
	[LedgerEntrySourceEnum.GUARDIANSHIP]: 'Опекунство',
	[LedgerEntrySourceEnum.MANUAL_EXPENSE]: 'Ручная операция'
};

const sourceBadgeStyles: Record<LedgerEntrySourceEnum, string> = {
	[LedgerEntrySourceEnum.DONATION_ONE_OFF]: 'bg-[#ffe7dc] text-[#b64d2a]',
	[LedgerEntrySourceEnum.DONATION_SUBSCRIPTION]: 'bg-[#e8f6ff] text-[#2f73a7]',
	[LedgerEntrySourceEnum.GUARDIANSHIP]: 'bg-[#e9f7e7] text-[#3f7d36]',
	[LedgerEntrySourceEnum.MANUAL_EXPENSE]: 'bg-[#efe9ff] text-[#6245a5]'
};

const DonationsListPage = (): JSX.Element => {
	const [year, setYear] = useState<number>(CURRENT_YEAR);
	const [month, setMonth] = useState<number>(CURRENT_MONTH);
	const [sourceFilter, setSourceFilter] = useState<'all' | LedgerEntrySourceEnum>('all');
	const [query, setQuery] = useState('');

	const ledgerQuery = useDonationLedgerQuery(year, month);
	const rows = ledgerQuery.data ?? [];

	const filteredRows = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		return rows.filter((row) => {
			if (sourceFilter !== 'all' && row.source !== sourceFilter) {
				return false;
			}
			if (!normalizedQuery) {
				return true;
			}
			const donorName = row.donorDisplayName?.trim() || 'Анонимно';
			return (
				donorName.toLowerCase().includes(normalizedQuery) ||
				(row.campaignTitle ?? '').toLowerCase().includes(normalizedQuery)
			);
		});
	}, [query, rows, sourceFilter]);

	const summary = useMemo(() => {
		const totalCount = filteredRows.length;
		const totalAmountKopecks = filteredRows.reduce((acc, row) => acc + row.grossAmount, 0);
		const uniqueDonors = new Set(
			filteredRows.map((row) => {
				const donorName = row.donorDisplayName?.trim();
				return donorName && donorName.length > 0 ? donorName : 'Анонимно';
			})
		).size;
		const averageKopecks = totalCount > 0 ? Math.round(totalAmountKopecks / totalCount) : 0;
		return { totalCount, totalAmountKopecks, uniqueDonors, averageKopecks };
	}, [filteredRows]);

	const topDonation = useMemo(
		() => filteredRows.reduce((top, row) => (row.grossAmount > top.grossAmount ? row : top), filteredRows[0]),
		[filteredRows]
	);

	const formatRub = (kopecks: number): string => `${Math.round(kopecks / 100).toLocaleString('ru-RU')} ₽`;

	return (
		<div className="flex flex-col gap-6 pb-8 md:gap-8">
			<section className="relative overflow-hidden rounded-4xl border border-(--color-border-soft) bg-linear-to-br from-[#fff9f5] via-[#fff3ea] to-[#fffdf8] p-5 shadow-[0_20px_44px_rgba(79,61,56,0.14)] sm:p-6">
				<div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#ff8c5d]/30 blur-3xl animate-pulse" />
				<div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-[#f8ce68]/35 blur-3xl animate-pulse" />
				<div className="pointer-events-none absolute right-[34%] top-8 h-12 w-12 rotate-12 rounded-2xl bg-[#ffd8cb]/70 animate-bounce [animation-duration:4s]" />
				<div className="pointer-events-none absolute right-[20%] top-24 h-7 w-7 rounded-full bg-[#f9b391] animate-bounce [animation-delay:900ms] [animation-duration:4.6s]" />

				<div className="relative grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
					<div>
						<p className="eyebrow inline-flex items-center gap-1.5 text-[#e26532]">
							<Sparkles className="h-3.5 w-3.5" />
							Публичная отчетность
						</p>
						<h1 className="mt-2 text-[28px] font-black uppercase leading-tight text-(--color-text-primary) sm:text-[34px]">
							Список пожертвований
						</h1>
						<p className="mt-2 max-w-3xl text-sm text-(--color-text-secondary)">
							Каждый перевод здесь - это чья-то помощь в нужный момент. Публикуем поступления прозрачно и
							бережно, а для анонимных доноров сохраняем приватность.
						</p>
						<div className="mt-4 flex flex-wrap items-center gap-2">
							<span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-xs font-semibold text-(--color-text-secondary) shadow-sm">
								<ShieldCheck className="h-3.5 w-3.5 text-[#e26532]" />
								Прозрачная лента операций
							</span>
						</div>
					</div>
				</div>
			</section>

			<section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<StatCard
					value={summary.totalCount.toLocaleString('ru-RU')}
					description="транзакций"
					label="Пожертвований"
					className="flex min-h-[120px] flex-col rounded-3xl border border-[#ffd8cb] bg-linear-to-br from-[#fffaf6] to-[#ffe7dc] p-4 shadow-[0_14px_26px_rgba(226,101,50,0.16)]"
				/>
				<StatCard
					value={formatRub(summary.totalAmountKopecks)}
					description="за выбранный период"
					label="Общая сумма"
					className="flex min-h-[120px] flex-col rounded-3xl border border-[#ffe7bf] bg-linear-to-br from-[#fffdf4] to-[#ffecc5] p-4 shadow-[0_14px_26px_rgba(219,164,65,0.16)]"
				/>
				<StatCard
					value={summary.uniqueDonors.toLocaleString('ru-RU')}
					description="включая анонимных"
					label="Доноров"
					className="flex min-h-[120px] flex-col rounded-3xl border border-[#d8efd3] bg-linear-to-br from-[#f9fff7] to-[#e0f7da] p-4 shadow-[0_14px_26px_rgba(79,152,72,0.15)]"
				/>
				<StatCard
					value={formatRub(summary.averageKopecks)}
					description="среднее значение"
					label="Средний чек"
					className="flex min-h-[120px] flex-col rounded-3xl border border-[#e4dcff] bg-linear-to-br from-[#faf8ff] to-[#ece6ff] p-4 shadow-[0_14px_26px_rgba(109,88,187,0.15)]"
				/>
			</section>

			{topDonation && (
				<section className="rounded-3xl border border-[#ffd8cb] bg-linear-to-r from-[#fff9f2] to-[#fff1e8] p-4 shadow-[0_12px_24px_rgba(226,101,50,0.12)] sm:p-5">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="inline-flex items-center gap-1.5 text-sm font-bold text-[#e26532]">
							<Gem className="h-4 w-4" />
							Самый крупный донат за выбранный период
						</p>
						<span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-(--color-text-secondary)">
							{formatRub(topDonation.grossAmount)}
						</span>
					</div>
					<p className="mt-2 text-sm text-(--color-text-secondary)">
						{topDonation.donorDisplayName?.trim() || 'Анонимно'} помог(ла){' '}
						{new Date(topDonation.occurredAt).toLocaleDateString('ru-RU')}
						{topDonation.campaignTitle ? ` в рамках сбора "${topDonation.campaignTitle}"` : ''}.
					</p>
				</section>
			)}

			<section className="rounded-3xl border border-[#f0dccf] bg-linear-to-br from-[#fffefc] to-[#fff7f1] p-4 shadow-[0_10px_20px_rgba(79,61,56,0.08)] sm:p-5">
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
					<label className="flex flex-col gap-1">
						<span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-(--color-text-secondary)">
							<CalendarDays className="h-3.5 w-3.5" />
							Месяц
						</span>
						<select
							value={month}
							onChange={(event) => setMonth(Number(event.target.value))}
							className="h-11 rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) px-3 text-sm text-(--color-text-primary)">
							{MONTH_OPTIONS.map((m) => (
								<option key={m.value} value={m.value}>
									{m.label}
								</option>
							))}
						</select>
					</label>
					<label className="flex flex-col gap-1">
						<span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-(--color-text-secondary)">
							<CalendarDays className="h-3.5 w-3.5" />
							Год
						</span>
						<select
							value={year}
							onChange={(event) => setYear(Number(event.target.value))}
							className="h-11 rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) px-3 text-sm text-(--color-text-primary)">
							{YEAR_OPTIONS.map((y) => (
								<option key={y} value={y}>
									{y}
								</option>
							))}
						</select>
					</label>
					<label className="flex flex-col gap-1">
						<span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-(--color-text-secondary)">
							<Wallet className="h-3.5 w-3.5" />
							Тип
						</span>
						<select
							value={sourceFilter}
							onChange={(event) => setSourceFilter(event.target.value as 'all' | LedgerEntrySourceEnum)}
							className="h-11 rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) px-3 text-sm text-(--color-text-primary)">
							<option value="all">Все</option>
							<option value={LedgerEntrySourceEnum.DONATION_ONE_OFF}>Разовые</option>
							<option value={LedgerEntrySourceEnum.DONATION_SUBSCRIPTION}>Подписки</option>
						</select>
					</label>
					<label className="flex flex-col gap-1">
						<span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-(--color-text-secondary)">
							<Search className="h-3.5 w-3.5" />
							Поиск
						</span>
						<input
							type="text"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Имя или сбор"
							className="h-11 rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) px-3 text-sm text-(--color-text-primary)"
						/>
					</label>
				</div>
			</section>

			{ledgerQuery.isLoading && (
				<section className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 text-center text-(--color-text-secondary)">
					Загружаем пожертвования...
				</section>
			)}

			{ledgerQuery.isError && (
				<section className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 text-center">
					<p className="text-(--color-text-primary)">Не удалось загрузить данные за выбранный период.</p>
					<button
						type="button"
						onClick={() => ledgerQuery.refetch()}
						className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-(--color-brand-brown) px-5 text-sm font-semibold text-(--color-text-on-dark)">
						Обновить
					</button>
				</section>
			)}

			{!ledgerQuery.isLoading && !ledgerQuery.isError && filteredRows.length === 0 && (
				<section className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 text-center text-(--color-text-secondary)">
					По выбранным фильтрам пожертвований не найдено.
				</section>
			)}

			{filteredRows.length > 0 && (
				<section className="overflow-x-auto rounded-3xl border border-[#efd9cd] bg-linear-to-br from-[#fffdfb] to-[#fff8f2] shadow-[0_12px_24px_rgba(79,61,56,0.08)]">
					<table className="min-w-[760px] w-full text-left">
						<thead className="bg-linear-to-r from-[#ffe8dc] to-[#ffeede] text-xs uppercase tracking-wide text-(--color-text-secondary)">
							<tr>
								<th className="px-4 py-3 font-bold">Дата</th>
								<th className="px-4 py-3 font-bold">Имя</th>
								<th className="px-4 py-3 font-bold">Тип</th>
								<th className="px-4 py-3 font-bold">Сумма</th>
								<th className="px-4 py-3 font-bold">Сбор</th>
							</tr>
						</thead>
						<tbody>
							{filteredRows.map((row) => {
								const donorName = row.donorDisplayName?.trim();
								const displayName = donorName && donorName.length > 0 ? donorName : 'Анонимно';
								return (
									<tr
										key={row.id}
										className="border-t border-(--color-border-soft) text-sm text-(--color-text-primary) transition-colors hover:bg-(--color-brand-brown-soft)/25">
										<td className="px-4 py-3">
											{new Date(row.occurredAt).toLocaleString('ru-RU')}
										</td>
										<td className="px-4 py-3 font-semibold">{displayName}</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
													sourceBadgeStyles[row.source]
												}`}>
												{sourceLabels[row.source]}
											</span>
										</td>
										<td className="px-4 py-3 font-semibold">{formatRub(row.grossAmount)}</td>
										<td className="px-4 py-3 text-(--color-text-secondary)">
											{row.campaignTitle ?? '—'}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</section>
			)}
		</div>
	);
};

export default DonationsListPage;
