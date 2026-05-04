import { LedgerEntrySourceEnum } from '@pif/shared';
import { CalendarDays, Gem, Search, Wallet } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { useDonationLedgerQuery } from '../../../../entities/donation';

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
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, i) => CURRENT_YEAR - i);

const sourceLabels: Record<LedgerEntrySourceEnum, string> = {
	[LedgerEntrySourceEnum.DONATION_ONE_OFF]: 'Разовый',
	[LedgerEntrySourceEnum.DONATION_SUBSCRIPTION]: 'Подписка',
	[LedgerEntrySourceEnum.GUARDIANSHIP]: 'Опекунство',
	[LedgerEntrySourceEnum.MANUAL_EXPENSE]: 'Операция'
};

const sourceBadgeStyles: Record<LedgerEntrySourceEnum, string> = {
	[LedgerEntrySourceEnum.DONATION_ONE_OFF]: 'bg-orange-100 text-orange-700',
	[LedgerEntrySourceEnum.DONATION_SUBSCRIPTION]: 'bg-blue-100 text-blue-700',
	[LedgerEntrySourceEnum.GUARDIANSHIP]: 'bg-green-100 text-green-700',
	[LedgerEntrySourceEnum.MANUAL_EXPENSE]: 'bg-purple-100 text-purple-700'
};

const formatRub = (kopecks: number): string => `${Math.round(kopecks / 100).toLocaleString('ru-RU')} ₽`;

const SelectField = ({
	label,
	icon: Icon,
	value,
	onChange,
	children
}: {
	label: string;
	icon: React.ElementType;
	value: string | number;
	onChange: (v: string) => void;
	children: React.ReactNode;
}): JSX.Element => (
	<label className="flex flex-col gap-1.5">
		<span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-(--color-text-secondary)">
			<Icon className="h-3 w-3" />
			{label}
		</span>
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="h-10 rounded-xl border border-(--color-border-soft) bg-(--color-surface-primary) px-3 text-sm font-medium text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-brand-accent)/40">
			{children}
		</select>
	</label>
);

const DonationsListPage = (): JSX.Element => {
	const [year, setYear] = useState<number>(CURRENT_YEAR);
	const [month, setMonth] = useState<number>(CURRENT_MONTH);
	const [sourceFilter, setSourceFilter] = useState<'all' | LedgerEntrySourceEnum>('all');
	const [query, setQuery] = useState('');

	const ledgerQuery = useDonationLedgerQuery(year, month);
	const rows = ledgerQuery.data ?? [];

	const filteredRows = useMemo(() => {
		const q = query.trim().toLowerCase();
		return rows.filter((row) => {
			if (sourceFilter !== 'all' && row.source !== sourceFilter) return false;
			if (!q) return true;
			const name = row.donorDisplayName?.trim() || 'Анонимно';
			return name.toLowerCase().includes(q) || (row.campaignTitle ?? '').toLowerCase().includes(q);
		});
	}, [query, rows, sourceFilter]);

	const summary = useMemo(() => {
		const totalAmountKopecks = filteredRows.reduce((acc, r) => acc + r.grossAmount, 0);
		const uniqueDonors = new Set(
			filteredRows.map((r) => {
				const n = r.donorDisplayName?.trim();
				return n && n.length > 0 ? n : '__anon__';
			})
		).size;
		return {
			totalCount: filteredRows.length,
			totalAmountKopecks,
			uniqueDonors,
			averageKopecks: filteredRows.length > 0 ? Math.round(totalAmountKopecks / filteredRows.length) : 0
		};
	}, [filteredRows]);

	const topDonation = useMemo(
		() =>
			filteredRows.length > 0
				? filteredRows.reduce((top, r) => (r.grossAmount > top.grossAmount ? r : top), filteredRows[0])
				: null,
		[filteredRows]
	);

	const selectedMonthLabel = MONTH_OPTIONS.find((m) => m.value === month)?.label ?? '';

	return (
		<div className="flex flex-col gap-5 pb-10 md:gap-6">
			<section className="flex flex-col gap-1 pt-2">
				<p className="eyebrow text-(--color-brand-accent)">Публичная отчётность</p>
				<h1 className="text-3xl font-black tracking-tight text-(--color-text-primary) md:text-4xl">
					Список пожертвований
				</h1>
				<p className="mt-1 max-w-xl text-sm text-(--color-text-secondary)">
					Каждый перевод — чья-то помощь в нужный момент. Публикуем поступления прозрачно, для анонимных
					доноров сохраняем приватность.
				</p>
			</section>

			<section className="grid grid-cols-2 divide-x divide-y divide-(--color-border-soft) overflow-hidden rounded-2xl border border-(--color-border-soft) bg-(--color-surface-primary) md:grid-cols-4 md:divide-y-0">
				{[
					{ value: summary.totalCount.toLocaleString('ru-RU'), label: 'Пожертвований', sub: 'за период' },
					{
						value: formatRub(summary.totalAmountKopecks),
						label: 'Собрано',
						sub: `${selectedMonthLabel} ${year}`
					},
					{ value: summary.uniqueDonors.toLocaleString('ru-RU'), label: 'Доноров', sub: 'включая анонимных' },
					{ value: formatRub(summary.averageKopecks), label: 'Средний чек', sub: 'на транзакцию' }
				].map(({ value, label, sub }) => (
					<div key={label} className="flex flex-col gap-1 px-5 py-4">
						<p className="text-2xl font-black tracking-tight text-(--color-text-primary) md:text-3xl">
							{value}
						</p>
						<p className="text-sm font-semibold text-(--color-text-primary)">{label}</p>
						<p className="text-xs text-(--color-text-secondary)">{sub}</p>
					</div>
				))}
			</section>

			{topDonation && (
				<section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
					<div className="flex items-center gap-2">
						<Gem className="h-4 w-4 shrink-0 text-orange-500" />
						<div>
							<p className="text-xs font-bold text-orange-600">Крупнейший донат за период</p>
							<p className="mt-0.5 text-sm text-(--color-text-secondary)">
								<span className="font-semibold text-(--color-text-primary)">
									{topDonation.donorDisplayName?.trim() || 'Анонимно'}
								</span>{' '}
								· {new Date(topDonation.occurredAt).toLocaleDateString('ru-RU')}
								{topDonation.campaignTitle ? ` · «${topDonation.campaignTitle}»` : ''}
							</p>
						</div>
					</div>
					<span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-orange-600 shadow-sm">
						{formatRub(topDonation.grossAmount)}
					</span>
				</section>
			)}

			<section className="rounded-2xl border border-(--color-border-soft) bg-(--color-surface-primary) p-4">
				<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
					<SelectField label="Месяц" icon={CalendarDays} value={month} onChange={(v) => setMonth(Number(v))}>
						{MONTH_OPTIONS.map((m) => (
							<option key={m.value} value={m.value}>
								{m.label}
							</option>
						))}
					</SelectField>
					<SelectField label="Год" icon={CalendarDays} value={year} onChange={(v) => setYear(Number(v))}>
						{YEAR_OPTIONS.map((y) => (
							<option key={y} value={y}>
								{y}
							</option>
						))}
					</SelectField>
					<SelectField
						label="Тип"
						icon={Wallet}
						value={sourceFilter}
						onChange={(v) => setSourceFilter(v as 'all' | LedgerEntrySourceEnum)}>
						<option value="all">Все</option>
						<option value={LedgerEntrySourceEnum.DONATION_ONE_OFF}>Разовые</option>
						<option value={LedgerEntrySourceEnum.DONATION_SUBSCRIPTION}>Подписки</option>
						<option value={LedgerEntrySourceEnum.GUARDIANSHIP}>Опекунство</option>
					</SelectField>
					<label className="flex flex-col gap-1.5">
						<span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-(--color-text-secondary)">
							<Search className="h-3 w-3" />
							Поиск
						</span>
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Имя или сбор"
							className="h-10 rounded-xl border border-(--color-border-soft) bg-(--color-surface-primary) px-3 text-sm text-(--color-text-primary) placeholder:text-(--color-text-secondary) focus:outline-none focus:ring-2 focus:ring-(--color-brand-accent)/40"
						/>
					</label>
				</div>
			</section>

			{ledgerQuery.isLoading && (
				<p className="py-10 text-center text-sm text-(--color-text-secondary)">Загружаем пожертвования…</p>
			)}
			{ledgerQuery.isError && (
				<div className="flex flex-col items-center gap-3 py-10">
					<p className="text-sm text-(--color-text-secondary)">
						Не удалось загрузить данные за выбранный период.
					</p>
					<button
						type="button"
						onClick={() => ledgerQuery.refetch()}
						className="inline-flex h-10 items-center rounded-full bg-(--color-brand-accent) px-5 text-sm font-semibold text-white">
						Попробовать снова
					</button>
				</div>
			)}
			{!ledgerQuery.isLoading && !ledgerQuery.isError && filteredRows.length === 0 && (
				<p className="py-10 text-center text-sm text-(--color-text-secondary)">
					По выбранным фильтрам пожертвований не найдено.
				</p>
			)}

			{filteredRows.length > 0 && (
				<section className="flex flex-col gap-2">
					<div className="hidden grid-cols-[1.4fr_1fr_0.7fr_0.9fr_1.6fr] gap-4 px-4 text-[11px] font-bold uppercase tracking-widest text-(--color-text-secondary) md:grid">
						<span>Дата</span>
						<span>Имя</span>
						<span>Тип</span>
						<span>Сумма</span>
						<span>Сбор</span>
					</div>

					{filteredRows.map((row) => {
						const name = row.donorDisplayName?.trim() || 'Анонимно';
						const date = new Date(row.occurredAt);
						return (
							<div
								key={row.id}
								className="grid grid-cols-1 gap-2 rounded-2xl border border-(--color-border-soft) bg-(--color-surface-primary) p-4 transition-colors hover:bg-(--color-surface-secondary) md:grid-cols-[1.4fr_1fr_0.7fr_0.9fr_1.6fr] md:items-center md:gap-4">
								<div className="flex items-center justify-between md:block">
									<span className="text-[11px] font-bold uppercase tracking-widest text-(--color-text-secondary) md:hidden">
										Дата
									</span>
									<span className="text-sm text-(--color-text-secondary)">
										{date.toLocaleDateString('ru-RU')}{' '}
										<span className="text-xs opacity-70">
											{date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
										</span>
									</span>
								</div>

								<div className="flex items-center justify-between md:block">
									<span className="text-[11px] font-bold uppercase tracking-widest text-(--color-text-secondary) md:hidden">
										Имя
									</span>
									<span className="text-sm font-semibold text-(--color-text-primary)">{name}</span>
								</div>

								<div className="flex items-center justify-between md:block">
									<span className="text-[11px] font-bold uppercase tracking-widest text-(--color-text-secondary) md:hidden">
										Тип
									</span>
									<span
										className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${sourceBadgeStyles[row.source]}`}>
										{sourceLabels[row.source]}
									</span>
								</div>

								<div className="flex items-center justify-between md:block">
									<span className="text-[11px] font-bold uppercase tracking-widest text-(--color-text-secondary) md:hidden">
										Сумма
									</span>
									<span className="text-sm font-bold text-(--color-text-primary)">
										{formatRub(row.grossAmount)}
									</span>
								</div>

								<div className="flex items-center justify-between md:block">
									<span className="text-[11px] font-bold uppercase tracking-widest text-(--color-text-secondary) md:hidden">
										Сбор
									</span>
									<span className="text-sm text-(--color-text-secondary) md:truncate">
										{row.campaignTitle ??
											(row.source == LedgerEntrySourceEnum.GUARDIANSHIP && row.title) ??
											'—'}
									</span>
								</div>
							</div>
						);
					})}
				</section>
			)}
		</div>
	);
};

export default DonationsListPage;
