import { ExternalLink, FileSpreadsheet, Loader2, RefreshCw } from 'lucide-react';
import { JSX, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
	useGenerateMonthlyFinanceReportMutation,
	usePublicMonthlyLedgerExcelUrlQuery
} from '../../../../entities/finance';
import { getErrorMessage } from '../../../../shared/api';
import { Button, Modal } from '../../../../shared/ui';

interface Props {
	year: number;
	month: number;
}

export const MonthlyReportPanel = ({ year, month }: Props): JSX.Element => {
	const excelQuery = usePublicMonthlyLedgerExcelUrlQuery({ year, month });
	const generateMutation = useGenerateMonthlyFinanceReportMutation();
	const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false);

	const isBusy = generateMutation.isPending;

	const onGenerate = async (forceRegenerate: boolean): Promise<void> => {
		try {
			const result = await generateMutation.mutateAsync({ year, month, forceRegenerate });
			if (result.reused) {
				toast.success('Использован уже готовый отчёт');
			} else {
				toast.success('Отчёт сформирован');
			}
			await excelQuery.refetch();
		} catch (err) {
			toast.error(await getErrorMessage(err));
		} finally {
			setConfirmRegenerateOpen(false);
		}
	};

	const onCopyUrl = async (): Promise<void> => {
		const url = excelQuery.data?.url;
		if (!url) return;
		try {
			await navigator.clipboard.writeText(url);
			toast.success('Ссылка скопирована');
		} catch {
			toast.error('Не удалось скопировать ссылку');
		}
	};

	const hasReadyUrl = Boolean(excelQuery.data?.url);
	const showLoading = excelQuery.isFetching && !excelQuery.data;

	return (
		<section className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-5 md:p-6 space-y-5">
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
				<div className="flex items-start gap-3 min-w-0">
					<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-2.5 text-(--color-brand-orange) shrink-0">
						<FileSpreadsheet size={22} />
					</div>
					<div className="min-w-0">
						<h3 className="text-lg font-bold text-(--color-text-primary) tracking-tight">
							Публичный отчёт XLSX
						</h3>
						<p className="text-sm text-(--color-text-secondary) mt-1.5 leading-relaxed">
							Файл для бухгалтерии и размещения на сайте. Первая генерация может занять до минуты — не
							закрывайте вкладку.
						</p>
					</div>
				</div>
				<div className="flex flex-wrap gap-2 shrink-0">
					{!hasReadyUrl && (
						<Button
							type="button"
							className="mt-0 w-full sm:w-auto px-4 py-2"
							isLoading={isBusy}
							onClick={() => void onGenerate(false)}>
							Сформировать
						</Button>
					)}

					{hasReadyUrl ? (
						<Button
							type="button"
							appearance="ghost"
							className="mt-0 w-full sm:w-auto px-4 py-2"
							disabled={isBusy}
							onClick={() => !isBusy && setConfirmRegenerateOpen(true)}>
							<RefreshCw size={16} />
							Пересоздать
						</Button>
					) : null}
				</div>
			</div>

			{showLoading ? (
				<div className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-bg-primary) px-4 py-3 text-sm text-(--color-text-secondary)">
					<Loader2 className="animate-spin shrink-0" size={18} />
					<span className="leading-relaxed">Проверяем, есть ли уже готовый файл за этот месяц…</span>
				</div>
			) : null}

			{excelQuery.isError ? (
				<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) px-4 py-3">
					<p className="text-sm text-(--color-text-secondary) leading-relaxed">
						Готового XLSX за выбранный месяц пока нет. Нажмите «Сформировать», чтобы создать файл и получить
						ссылку.
					</p>
				</div>
			) : null}

			{hasReadyUrl && excelQuery.data ? (
				<div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 md:p-5 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
					<div className="min-w-0 flex-1">
						<p className="text-xs font-bold uppercase tracking-widest text-emerald-200/90">
							Публичная ссылка
						</p>
						<p className="text-sm font-mono text-(--color-text-primary) mt-2 break-all leading-relaxed">
							{excelQuery.data.url}
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-2 shrink-0 lg:pt-1">
						<a href={excelQuery.data.url} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
							<Button type="button" appearance="ghost" className="mt-0 w-full px-4 py-2.5 min-h-11">
								<ExternalLink size={16} />
								Открыть
							</Button>
						</a>
						<Button
							type="button"
							className="mt-0 w-full sm:w-auto px-4 py-2.5 min-h-11"
							onClick={() => void onCopyUrl()}>
							Скопировать ссылку
						</Button>
					</div>
				</div>
			) : null}

			{confirmRegenerateOpen ? (
				<Modal title="Пересоздать отчёт?" onClose={() => setConfirmRegenerateOpen(false)}>
					<p className="text-sm text-(--color-text-secondary) mb-4 leading-relaxed">
						Текущий файл будет заменён новым. Старая версия в хранилище перестанет быть актуальной для этой
						ссылки.
					</p>
					<div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
						<Button
							type="button"
							appearance="ghost"
							className="mt-0 w-full sm:w-auto grow"
							onClick={() => setConfirmRegenerateOpen(false)}>
							Отмена
						</Button>
						<Button
							type="button"
							className="mt-0 w-full sm:w-auto grow"
							isLoading={isBusy}
							onClick={() => void onGenerate(true)}>
							Пересоздать
						</Button>
					</div>
				</Modal>
			) : null}
		</section>
	);
};
