import { LedgerEntryDirectionEnum, LedgerEntrySourceEnum, UserRole } from '@pif/shared';
import { Loader2, Plus } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
	AdminLedgerEntryRow,
	useDeleteManualExpenseMutation,
	useMonthlyLedgerQuery
} from '../../../../entities/finance';
import { useSession } from '../../../../entities/session/model/hooks';
import {
	FinanceLedgerList,
	groupLedgerRowsByDay,
	ManualExpenseModal,
	MonthlyReportPanel,
	summarizeLedgerMonth,
	useFinancePeriodFromUrl
} from '../../../../features/finance';
import { getErrorMessage } from '../../../../shared/api';
import { formatKopecksAsRub } from '../../../../shared/lib';
import { Button, ErrorState, Modal, PageTitle } from '../../../../shared/ui';

export const FinancePage = (): JSX.Element => {
	const { period, setPeriod, goCurrentMonth, goPreviousMonth, goNextMonth, label } = useFinancePeriodFromUrl();
	const { data: session } = useSession();
	const role = session?.user.role;
	const userId = session?.user?.id;

	const canManageReport = role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER;

	const ledgerQuery = useMonthlyLedgerQuery(
		{ year: period.year, month: period.month },
		{ enabled: Boolean(session) }
	);

	const deleteMutation = useDeleteManualExpenseMutation();
	const [expenseModal, setExpenseModal] = useState<
		null | { mode: 'create' } | { mode: 'edit'; row: AdminLedgerEntryRow }
	>(null);
	const [deleteTarget, setDeleteTarget] = useState<AdminLedgerEntryRow | null>(null);

	const summary = useMemo(() => summarizeLedgerMonth(ledgerQuery.data ?? []), [ledgerQuery.data]);
	const grouped = useMemo(() => groupLedgerRowsByDay(ledgerQuery.data ?? []), [ledgerQuery.data]);

	const canManageManualExpense = useMemo(() => {
		return (row: AdminLedgerEntryRow): boolean => {
			if (
				row.source !== LedgerEntrySourceEnum.MANUAL_EXPENSE ||
				row.direction !== LedgerEntryDirectionEnum.EXPENSE
			) {
				return false;
			}
			if (role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER) {
				return true;
			}
			if (role === UserRole.VOLUNTEER && row.createdByUserId != null && row.createdByUserId === userId) {
				return true;
			}
			return false;
		};
	}, [role, userId]);

	const monthInputValue = `${period.year}-${String(period.month).padStart(2, '0')}`;

	const onConfirmDelete = async (): Promise<void> => {
		if (!deleteTarget) return;
		try {
			await deleteMutation.mutateAsync(deleteTarget.id);
			toast.success('Расход удалён');
			setDeleteTarget(null);
		} catch (err) {
			toast.error(await getErrorMessage(err));
		}
	};

	if (!session) {
		return <ErrorState title="Нет сессии" description="Войдите в систему, чтобы открыть финансы." />;
	}

	if (ledgerQuery.isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (ledgerQuery.isError) {
		return (
			<ErrorState
				description={ledgerQuery.error?.message ?? 'Не удалось загрузить проводки.'}
				onRetry={() => void ledgerQuery.refetch()}
			/>
		);
	}

	return (
		<div className="space-y-8 pb-28 md:pb-10 relative max-w-5xl">
			<PageTitle
				title="Финансы"
				subtitle="Сводка за месяц, выписка по дням и ручные расходы. XLSX — для бухгалтерии и публикации.">
				<div className="w-full md:w-auto md:min-w-[200px] flex flex-col gap-2 mt-2 md:mt-0 md:items-end">
					<label className="flex flex-col gap-1.5 w-full md:items-end">
						<span className="text-[11px] font-bold uppercase tracking-widest text-(--color-text-secondary) px-0.5">
							Отчётный месяц
						</span>
						<input
							type="month"
							value={monthInputValue}
							onChange={(e) => {
								const v = e.target.value;
								if (!v) return;
								const [y, m] = v.split('-').map(Number);
								if (Number.isFinite(y) && Number.isFinite(m)) {
									setPeriod({ year: y, month: m });
								}
							}}
							className="w-full md:w-auto rounded-xl border border-(--color-border) bg-(--color-bg-secondary) px-3 py-2.5 text-sm font-medium text-(--color-text-primary) min-h-11"
						/>
					</label>
				</div>
			</PageTitle>

			<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-5 space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div>
						<p className="text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">
							Период
						</p>
						<p className="text-lg font-semibold text-(--color-text-primary) mt-1 capitalize leading-snug">
							{label}
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							appearance="ghost"
							className="mt-0 px-4 py-2.5 text-sm min-h-11"
							onClick={goPreviousMonth}>
							← Предыдущий
						</Button>
						<Button type="button" className="mt-0 px-4 py-2.5 text-sm min-h-11" onClick={goCurrentMonth}>
							Текущий месяц
						</Button>
						{canManageReport ? (
							<Button
								type="button"
								appearance="ghost"
								className="mt-0 px-4 py-2.5 text-sm min-h-11"
								onClick={goNextMonth}>
								Следующий месяц →
							</Button>
						) : null}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-5 md:p-6 border-l-4 border-l-emerald-500/50">
					<p className="text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">Приходы</p>
					<p className="text-2xl font-bold text-emerald-400 mt-3 tabular-nums tracking-tight">
						{formatKopecksAsRub(summary.incomeKopecks)}
					</p>
					<p className="text-xs text-(--color-text-secondary) mt-2 leading-relaxed">
						Донаты, опекунство и др.
					</p>
				</div>
				<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-5 md:p-6 border-l-4 border-l-rose-500/45">
					<p className="text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">Расходы</p>
					<p className="text-2xl font-bold text-(--color-text-primary) mt-3 tabular-nums tracking-tight">
						{formatKopecksAsRub(summary.expenseKopecks)}
					</p>
					<p className="text-xs text-(--color-text-secondary) mt-2 leading-relaxed">Включая ручные расходы</p>
				</div>
				<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-5 md:p-6 border-l-4 border-l-(--color-brand-orange)/60">
					<p className="text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">Сальдо</p>
					<p
						className={`text-2xl font-bold mt-3 tabular-nums tracking-tight ${
							summary.balanceKopecks >= 0 ? 'text-emerald-400' : 'text-rose-300'
						}`}>
						{formatKopecksAsRub(summary.balanceKopecks)}
					</p>
					<p className="text-xs text-(--color-text-secondary) mt-2 leading-relaxed">
						Приходы минус расходы за месяц
					</p>
				</div>
			</div>

			{canManageReport ? (
				<MonthlyReportPanel year={period.year} month={period.month} />
			) : (
				<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) px-5 py-5 md:px-6 md:py-6 max-w-3xl">
					<p className="text-sm text-(--color-text-secondary) leading-relaxed">
						Выгрузка XLSX и пересоздание отчёта доступны{' '}
						<span className="text-(--color-text-primary) font-medium">администратору</span> и{' '}
						<span className="text-(--color-text-primary) font-medium">старшему волонтёру</span>. Вы
						по-прежнему видите все проводки и можете добавлять свои ручные расходы.
					</p>
				</div>
			)}

			<section className="space-y-4 pt-2">
				<div className="px-1 border-b border-(--color-border) pb-4">
					<h2 className="text-xl font-bold text-(--color-text-primary) tracking-tight">Выписка</h2>
					<p className="text-sm text-(--color-text-secondary) mt-1.5 leading-relaxed max-w-2xl">
						Операции сгруппированы по дням (сначала последние). Суммы — нетто по проводке; знак показывает
						приход или расход.
					</p>
				</div>
				<FinanceLedgerList
					grouped={grouped}
					canManageManualExpense={canManageManualExpense}
					onEdit={(row) => setExpenseModal({ mode: 'edit', row })}
					onDelete={(row) => setDeleteTarget(row)}
				/>
			</section>

			<button
				type="button"
				onClick={() => setExpenseModal({ mode: 'create' })}
				className="fixed bottom-24 right-4 z-40 md:bottom-8 md:right-10 flex items-center gap-2 rounded-full bg-(--color-brand-orange) text-white px-5 py-3.5 shadow-lg shadow-(--color-brand-orange)/30 font-bold text-sm hover:opacity-95 active:scale-[0.98] transition-all md:px-6"
				aria-label="Добавить расход">
				<Plus size={22} />
				<span className="hidden sm:inline">Расход</span>
			</button>

			{expenseModal ? (
				<ManualExpenseModal
					mode={expenseModal.mode}
					entry={expenseModal.mode === 'edit' ? expenseModal.row : undefined}
					onClose={() => setExpenseModal(null)}
				/>
			) : null}

			{deleteTarget ? (
				<Modal title="Удалить расход?" onClose={() => setDeleteTarget(null)}>
					<p className="text-sm text-(--color-text-secondary) mb-4">
						Будет удалена проводка «{deleteTarget.title}» на сумму{' '}
						{formatKopecksAsRub(deleteTarget.netAmount)}. Это действие нельзя отменить.
					</p>
					<div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
						<Button
							type="button"
							appearance="ghost"
							className="mt-0 w-full sm:w-auto"
							onClick={() => setDeleteTarget(null)}>
							Отмена
						</Button>
						<Button
							type="button"
							appearance="red"
							className="mt-0 w-full sm:w-auto"
							isLoading={deleteMutation.isPending}
							onClick={() => void onConfirmDelete()}>
							Удалить
						</Button>
					</div>
				</Modal>
			) : null}
		</div>
	);
};

export default FinancePage;
