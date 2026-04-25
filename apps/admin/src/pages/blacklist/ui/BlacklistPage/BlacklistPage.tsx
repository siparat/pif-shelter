import { blacklistSourceSchema } from '@pif/contracts';
import { BlacklistSource, BlacklistStatus, UserRole } from '@pif/shared';
import { AlertTriangle, Info, Loader2, ShieldAlert, ShieldCheck, ShieldX, Trash2 } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
	BlacklistEntry,
	useApproveContactsMutation,
	useBanContactsMutation,
	useBlacklistList,
	useDeleteBlacklistEntryMutation,
	useSuspectContactsMutation
} from '../../../../entities/blacklist';
import { useSession } from '../../../../entities/session/model/hooks';
import { getErrorMessage } from '../../../../shared/api';
import { Button, EmptyState, ErrorState, Input, Modal, PageTitle, Pagination, Select } from '../../../../shared/ui';

const STATUS_OPTIONS: { value: BlacklistStatus | ''; label: string }[] = [
	{ value: '', label: 'Все статусы' },
	{ value: BlacklistStatus.BLOCKED, label: 'Заблокирован' },
	{ value: BlacklistStatus.SUSPICION, label: 'Подозрение' },
	{ value: BlacklistStatus.SUSPICION_EXPIRED, label: 'Подозрение истекло' },
	{ value: BlacklistStatus.APPEALED, label: 'Разблокирован' }
];

const SOURCE_OPTIONS: { value: BlacklistSource | ''; label: string }[] = [
	{ value: '', label: 'Все источники' },
	{ value: BlacklistSource.PHONE, label: 'Телефон' },
	{ value: BlacklistSource.EMAIL, label: 'Email' },
	{ value: BlacklistSource.TELEGRAM, label: 'Telegram' }
];

const SORT_OPTIONS = [
	{ value: 'addedAt:desc', label: 'Сначала новые' },
	{ value: 'addedAt:asc', label: 'Сначала старые' },
	{ value: 'value:asc', label: 'По значению A-Z' }
];

const STATUS_LABEL: Record<BlacklistStatus, string> = {
	[BlacklistStatus.BLOCKED]: 'Заблокирован',
	[BlacklistStatus.SUSPICION]: 'Подозрение',
	[BlacklistStatus.SUSPICION_EXPIRED]: 'Подозрение истекло',
	[BlacklistStatus.APPEALED]: 'Разблокирован'
};

const STATUS_BADGE_CLASS: Record<BlacklistStatus, string> = {
	[BlacklistStatus.BLOCKED]: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
	[BlacklistStatus.SUSPICION]: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
	[BlacklistStatus.SUSPICION_EXPIRED]: 'border-yellow-500/35 bg-yellow-500/10 text-yellow-300',
	[BlacklistStatus.APPEALED]: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
};

const STATUS_CARD_CLASS: Record<BlacklistStatus, string> = {
	[BlacklistStatus.BLOCKED]: 'border-rose-500/30 bg-rose-500/6',
	[BlacklistStatus.SUSPICION]: 'border-amber-500/30 bg-amber-500/6',
	[BlacklistStatus.SUSPICION_EXPIRED]: 'border-yellow-500/25 bg-yellow-500/5',
	[BlacklistStatus.APPEALED]: 'border-emerald-500/30 bg-emerald-500/6'
};

export const BlacklistPage = (): JSX.Element => {
	const { data: session } = useSession();
	const role = session?.user.role;
	const canView = role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER;

	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(20);
	const [status, setStatus] = useState<BlacklistStatus | ''>('');
	const [source, setSource] = useState<BlacklistSource | ''>('');
	const [sort, setSort] = useState('addedAt:desc');

	const [actionSource, setActionSource] = useState<BlacklistSource>(BlacklistSource.PHONE);
	const [actionValue, setActionValue] = useState('');
	const [actionReason, setActionReason] = useState('');
	const [suspicionEndsAt, setSuspicionEndsAt] = useState('');
	const [isSuspectModalOpen, setIsSuspectModalOpen] = useState(false);

	const query = useBlacklistList({
		page,
		perPage,
		status: status || undefined,
		source: source || undefined,
		sort
	});

	const banMutation = useBanContactsMutation();
	const suspectMutation = useSuspectContactsMutation();
	const approveMutation = useApproveContactsMutation();
	const deleteMutation = useDeleteBlacklistEntryMutation();

	const isActing = banMutation.isPending || suspectMutation.isPending || approveMutation.isPending;

	const parsedSource = useMemo(
		() => blacklistSourceSchema.safeParse({ source: actionSource, value: actionValue }),
		[actionSource, actionValue]
	);

	const sourcePayload = parsedSource.success ? [parsedSource.data] : null;

	const resetActionForm = (): void => {
		setActionValue('');
		setActionReason('');
		setSuspicionEndsAt('');
	};

	const closeSuspectModal = (): void => {
		setIsSuspectModalOpen(false);
		setSuspicionEndsAt('');
	};

	const runAction = async (mode: 'ban' | 'suspect' | 'approve'): Promise<boolean> => {
		if (!sourcePayload) {
			toast.error('Проверьте источник и значение контакта.');
			return false;
		}
		try {
			if (mode === 'ban') {
				if (actionReason.trim().length < 2) {
					toast.error('Укажите причину (минимум 2 символа).');
					return false;
				}
				await banMutation.mutateAsync({ reason: actionReason.trim(), sources: sourcePayload });
				toast.success('Контакт заблокирован');
			}
			if (mode === 'suspect') {
				if (actionReason.trim().length < 2) {
					toast.error('Укажите причину (минимум 2 символа).');
					return false;
				}
				if (!suspicionEndsAt) {
					toast.error('Укажите дату окончания подозрения.');
					return false;
				}
				await suspectMutation.mutateAsync({
					reason: actionReason.trim(),
					suspicionEndsAt: new Date(suspicionEndsAt).toISOString(),
					sources: sourcePayload
				});
				toast.success('Контакт помечен как подозрительный');
			}
			if (mode === 'approve') {
				await approveMutation.mutateAsync(sourcePayload);
				toast.success('Контакт разблокирован');
			}
			resetActionForm();
			return true;
		} catch (error) {
			toast.error(await getErrorMessage(error));
			return false;
		}
	};

	const handleToggleBlockRow = async (entry: BlacklistEntry): Promise<void> => {
		try {
			if (entry.status === BlacklistStatus.APPEALED) {
				await banMutation.mutateAsync({
					reason: entry.reason ?? 'Повторная блокировка из админ-панели',
					sources: [{ source: entry.source, value: entry.value }]
				});
				toast.success('Контакт заблокирован');
				return;
			}
			await approveMutation.mutateAsync([{ source: entry.source, value: entry.value }]);
			toast.success('Контакт разблокирован');
		} catch (error) {
			toast.error(await getErrorMessage(error));
		}
	};

	const handleDeleteRow = async (entry: BlacklistEntry): Promise<void> => {
		try {
			await deleteMutation.mutateAsync(entry.id);
			toast.success('Запись удалена');
		} catch (error) {
			toast.error(await getErrorMessage(error));
		}
	};

	if (!canView) {
		return <ErrorState description="Раздел черного списка доступен только старшему волонтёру и администратору." />;
	}

	if (query.isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (query.isError || !query.data) {
		return (
			<ErrorState
				description={query.error?.message ?? 'Не удалось загрузить черный список.'}
				onRetry={() => void query.refetch()}
			/>
		);
	}

	const entries = query.data.data;
	const meta = query.data.meta;

	return (
		<div className="space-y-6 pb-10">
			<PageTitle title="Черный список" subtitle="Модерация контактов в формах в приложении" />

			<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 space-y-3">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-2">
					<Select
						value={status}
						onChange={(e) => setStatus(e.target.value as BlacklistStatus | '')}
						options={STATUS_OPTIONS}
						small
					/>
					<Select
						value={source}
						onChange={(e) => setSource(e.target.value as BlacklistSource | '')}
						options={SOURCE_OPTIONS}
						small
					/>
					<Select value={sort} onChange={(e) => setSort(e.target.value)} options={SORT_OPTIONS} small />
					<Select<number>
						value={perPage}
						onChange={(e) => setPerPage(Number(e.target.value))}
						options={[
							{ value: 20, label: '20 на странице' },
							{ value: 50, label: '50 на странице' },
							{ value: 100, label: '100 на странице' }
						]}
						small
					/>
				</div>
			</div>

			<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 space-y-3">
				<div className="flex items-center gap-2">
					<ShieldAlert size={16} />
					<p className="font-medium">Быстрое действие по контакту</p>
				</div>
				<div className="flex items-center gap-2">
					<p className="text-xs text-(--color-text-secondary)">
						Этот раздел позволяет быстро добавить контакт в черный список, разблокировать его или
						отслеживать подозрительные контакты (контакты которые подозрительно используются для спама или
						других вредоносных действий, но без прямого документального доказательства).
					</p>
				</div>
				<div className="flex items-center gap-2">
					<p className="text-xs text-(--color-text-secondary)">
						Подозрительные контакты не смогут использоваться в формах в приложении до указанной даты,
						например при создании встречи или оформлении опекунства.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<p className="text-xs text-(--color-text-secondary)">
						Разблокированные контакты никогда не будут подозреваться или блокироваться без административного
						вмешательства.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<p className="text-xs text-(--color-text-secondary)">
						Заблокированные контакты будут блокироваться в формах в приложении перманентно, до тех пор пока
						не будут разблокированы администратором.
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
					<Select
						value={actionSource}
						onChange={(e) => setActionSource(e.target.value as BlacklistSource)}
						options={
							SOURCE_OPTIONS.filter((item) => item.value !== '') as {
								value: BlacklistSource;
								label: string;
							}[]
						}
						label="Источник"
						small
					/>
					<Input
						value={actionValue}
						onChange={(e) => setActionValue(e.target.value)}
						label="Контакт"
						placeholder={
							actionSource === BlacklistSource.PHONE
								? '+79990000000'
								: actionSource === BlacklistSource.EMAIL
									? 'user@mail.com'
									: '@username'
						}
						small
					/>
					<Input
						value={actionReason}
						onChange={(e) => setActionReason(e.target.value)}
						label="Причина"
						placeholder="Кратко, почему модерация нужна"
						small
					/>
				</div>
				{!parsedSource.success && actionValue.trim() && (
					<p className="text-xs text-rose-300">
						{parsedSource.error.issues[0]?.message ?? 'Некорректный контакт'}
					</p>
				)}
				<div className="flex flex-col sm:flex-row gap-2">
					<Button
						className="mt-0 w-full sm:w-auto px-4 py-2"
						onClick={() => {
							setSuspicionEndsAt('');
							void runAction('ban');
						}}
						isLoading={isActing}>
						<ShieldX size={14} />
						Заблокировать
					</Button>
					<Button
						className="mt-0 w-full sm:w-auto px-4 py-2"
						appearance="ghost"
						onClick={() => {
							setIsSuspectModalOpen(true);
						}}
						isLoading={isActing}>
						<AlertTriangle size={14} />
						Подозрение
					</Button>
					<Button
						className="mt-0 w-full sm:w-auto px-4 py-2"
						appearance="ghost"
						onClick={() => {
							setSuspicionEndsAt('');
							void runAction('approve');
						}}
						isLoading={isActing}>
						<ShieldCheck size={14} />
						Разблокировать
					</Button>
				</div>
				<div className="flex items-center gap-2">
					<Info style={{ color: 'var(--color-text-secondary)' }} size={16} />
					<p className="text-xs text-(--color-text-secondary)">
						Подозрение означает, что контакт подозрительно используется для спама или других вредоносных
						действий. Действует до указанной даты.
					</p>
				</div>
			</div>

			{entries.length === 0 ? (
				<EmptyState
					title="Черный список пуст"
					description="Записей по текущим фильтрам не найдено."
					actionLabel="Сбросить фильтры"
					onAction={() => {
						setStatus('');
						setSource('');
						setSort('addedAt:desc');
						setPage(1);
					}}
				/>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
					{entries.map((entry) => (
						<div
							key={entry.id}
							className={`rounded-2xl border p-4 space-y-3 ${STATUS_CARD_CLASS[entry.status]}`}>
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-base font-semibold break-all">{entry.value}</p>
									<div className="flex flex-wrap items-center gap-1.5 mt-1">
										<span
											className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border ${STATUS_BADGE_CLASS[entry.status]}`}>
											{STATUS_LABEL[entry.status]}
										</span>
										<span className="text-xs text-(--color-text-secondary)">{entry.source}</span>
										<span className="text-xs text-(--color-text-secondary)">·</span>
										<span className="text-xs text-(--color-text-secondary)">{entry.context}</span>
									</div>
								</div>
								<div className="text-xs text-(--color-text-secondary)">
									{entry.addedAt ? new Date(entry.addedAt).toLocaleString('ru-RU') : '—'}
								</div>
							</div>
							{entry.reason && <p className="text-sm text-(--color-text-secondary)">{entry.reason}</p>}
							<div className="flex flex-wrap gap-2">
								<Button
									className="mt-0 w-auto px-3 py-1.5 text-xs"
									appearance="ghost"
									onClick={() => void handleToggleBlockRow(entry)}
									isLoading={approveMutation.isPending || banMutation.isPending}>
									{entry.status === BlacklistStatus.APPEALED ? 'Заблокировать' : 'Разблокировать'}
								</Button>
								<button
									type="button"
									onClick={() => void handleDeleteRow(entry)}
									className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 px-3 py-1.5 border border-rose-500/40 rounded-lg">
									<Trash2 size={12} />
									Удалить
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			<Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={(next) => setPage(next)} />

			{isSuspectModalOpen && (
				<Modal title="Подозрительный контакт" onClose={closeSuspectModal}>
					<div className="space-y-3">
						<p className="text-sm text-(--color-text-secondary)">
							Укажите дату, до которой контакт будет считаться подозрительным.
						</p>
						<Input
							value={suspicionEndsAt}
							onChange={(e) => setSuspicionEndsAt(e.target.value)}
							label="Действует до"
							type="datetime-local"
						/>
						<div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
							<Button appearance="ghost" className="mt-0 sm:w-auto px-4 py-2" onClick={closeSuspectModal}>
								Отмена
							</Button>
							<Button
								className="mt-0 sm:w-auto px-4 py-2"
								isLoading={isActing}
								onClick={async () => {
									const isSuccess = await runAction('suspect');
									if (isSuccess) {
										closeSuspectModal();
									}
								}}>
								Применить подозрение
							</Button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
};

export default BlacklistPage;
