import { LedgerEntryDirectionEnum, LedgerEntrySourceEnum } from '@pif/shared';
import dayjs from 'dayjs';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { JSX } from 'react';
import { AdminLedgerEntryRow, buildLedgerReceiptRedirectUrl } from '../../../../entities/finance';
import { formatKopecksAsRub } from '../../../../shared/lib';
import { Button } from '../../../../shared/ui';
import { LEDGER_DIRECTION_LABEL, LEDGER_SOURCE_LABEL } from '../../lib/ledger-labels';

interface Props {
	grouped: Map<string, AdminLedgerEntryRow[]>;
	canManageManualExpense: (row: AdminLedgerEntryRow) => boolean;
	onEdit: (row: AdminLedgerEntryRow) => void;
	onDelete: (row: AdminLedgerEntryRow) => void;
}

const formatDayHeading = (dayKey: string): string => {
	const [y, m, d] = dayKey.split('-').map(Number);
	if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return dayKey;
	const date = new Date(y, m - 1, d);
	const raw = new Intl.DateTimeFormat('ru-RU', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(date);
	return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const metaParts = (row: AdminLedgerEntryRow): string[] => {
	const parts: string[] = [dayjs(row.occurredAt).format('HH:mm')];
	if (row.donorDisplayName) parts.push(row.donorDisplayName);
	if (row.campaignTitle) parts.push(row.campaignTitle);
	return parts;
};

const recordsLabel = (n: number): string => {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return 'запись';
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'записи';
	return 'записей';
};

export const FinanceLedgerList = ({ grouped, canManageManualExpense, onEdit, onDelete }: Props): JSX.Element => {
	const days = [...grouped.keys()];
	const totalRows = [...grouped.values()].reduce((acc, list) => acc + list.length, 0);

	if (days.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-bg-secondary)/40 px-6 py-14 text-center max-w-2xl mx-auto">
				<p className="text-base font-medium text-(--color-text-primary)">За выбранный месяц записей нет</p>
				<p className="text-sm text-(--color-text-secondary) mt-2 leading-relaxed max-w-md mx-auto">
					Когда появятся приходы и расходы, они отобразятся здесь по дням — как в банковской выписке.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-10 max-w-3xl">
			<p className="text-sm text-(--color-text-secondary) px-1">
				Всего за период:{' '}
				<span className="font-semibold text-(--color-text-primary) tabular-nums">{totalRows}</span>{' '}
				{recordsLabel(totalRows)}
			</p>
			{days.map((dayKey) => {
				const rows = grouped.get(dayKey) ?? [];
				return (
					<section key={dayKey} className="space-y-4">
						<header className="sticky top-0 z-10 -mx-1 px-1 py-3 bg-(--color-bg-primary)/95 backdrop-blur-md border-b border-(--color-border)">
							<h3 className="text-base font-semibold text-(--color-text-primary) leading-tight">
								{formatDayHeading(dayKey)}
							</h3>
							<p className="text-xs text-(--color-text-secondary) mt-1 tabular-nums">
								{rows.length} {recordsLabel(rows.length)}
							</p>
						</header>
						<ul className="flex flex-col gap-3">
							{rows.map((row) => {
								const isIncome = row.direction === LedgerEntryDirectionEnum.INCOME;
								const canManage = canManageManualExpense(row);
								const receiptUrl = row.receiptStorageKey ? buildLedgerReceiptRedirectUrl(row.id) : null;
								const accent = isIncome ? 'border-l-emerald-500/70' : 'border-l-rose-500/55';
								return (
									<li
										key={row.id}
										className={`rounded-2xl border border-(--color-border) border-l-4 ${accent} bg-(--color-bg-secondary) pl-4 pr-4 py-4 shadow-sm/10`}>
										<div className="flex flex-wrap items-start justify-between gap-3 gap-y-2">
											<div className="flex flex-wrap items-center gap-2 min-w-0">
												<span
													className={
														isIncome
															? 'shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide bg-emerald-500/15 text-emerald-300'
															: 'shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide bg-rose-500/12 text-rose-300'
													}>
													{LEDGER_DIRECTION_LABEL[row.direction]}
												</span>
												<span className="text-xs text-(--color-text-secondary) font-medium truncate max-w-[min(100%,14rem)] sm:max-w-xs">
													{LEDGER_SOURCE_LABEL[row.source]}
												</span>
											</div>
											<p
												className={`shrink-0 text-lg sm:text-xl font-bold tabular-nums tracking-tight ${
													isIncome ? 'text-emerald-400' : 'text-(--color-text-primary)'
												}`}>
												<span className="sr-only">{isIncome ? 'Плюс ' : 'Минус '}</span>
												{isIncome ? '+' : '−'}
												{formatKopecksAsRub(row.netAmount)}
											</p>
										</div>
										<p className="text-[15px] sm:text-base font-semibold text-(--color-text-primary) leading-snug mt-3 pr-1">
											{row.title}
										</p>
										<p className="text-sm text-(--color-text-secondary) mt-2 leading-relaxed">
											{metaParts(row).join(' · ')}
										</p>
										{row.note ? (
											<p className="text-sm text-(--color-text-secondary) mt-3 leading-relaxed pl-3 border-l-2 border-(--color-border)">
												{row.note}
											</p>
										) : null}
										<div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-(--color-border)/80">
											{receiptUrl ? (
												<a
													href={receiptUrl}
													target="_blank"
													rel="noreferrer"
													className="inline-flex">
													<Button
														type="button"
														appearance="ghost"
														className="mt-0 px-3 py-2 text-sm min-h-11">
														<ExternalLink size={16} />
														Чек
													</Button>
												</a>
											) : null}
											{row.source === LedgerEntrySourceEnum.MANUAL_EXPENSE && canManage ? (
												<>
													<Button
														type="button"
														appearance="ghost"
														className="mt-0 px-3 py-2 text-sm min-h-11"
														onClick={() => onEdit(row)}>
														<Pencil size={16} />
														Изменить
													</Button>
													<Button
														type="button"
														appearance="ghost"
														className="mt-0 px-3 py-2 text-sm min-h-11 text-red-400 hover:text-red-300"
														onClick={() => onDelete(row)}>
														<Trash2 size={16} />
														Удалить
													</Button>
												</>
											) : null}
										</div>
									</li>
								);
							})}
						</ul>
					</section>
				);
			})}
		</div>
	);
};
