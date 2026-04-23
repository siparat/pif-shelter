import { GuardianshipStatusEnum, UserRole } from '@pif/shared';
import dayjs from 'dayjs';
import { AlertTriangle, ExternalLink, Info, Loader2, MessageSquarePlus, Send, XCircle } from 'lucide-react';
import { JSX, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../../../../entities/session/model/hooks';
import {
	canSendGuardianshipReport,
	GuardianshipItem,
	GuardianshipStatusBadge,
	useCanCancelGuardianship,
	useGuardianshipsList
} from '../../../../entities/guardianship';
import { CancelGuardianshipModal } from '../../../../features/guardianship-cancel';
import { SendReportModal } from '../../../../features/guardianship-send-report';
import { ROUTES } from '../../../../shared/config';
import { getUserTelegramLink } from '../../../../shared/lib';
import { Button } from '../../../../shared/ui';

interface Props {
	animalId: string;
	animalName: string;
	animalCuratorId: string | null;
}

const formatDate = (iso: string | null): string => (iso ? dayjs(iso).format('DD.MM.YYYY') : '—');

const formatMoney = (value: number | null): string => {
	if (value == null) {
		return '—';
	}
	return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(
		value
	);
};

export const AnimalGuardianSection = ({ animalId, animalName, animalCuratorId }: Props): JSX.Element | null => {
	const { data: session } = useSession();
	const role = session?.user.role as UserRole | undefined;
	const isStaff = role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER || role === UserRole.VOLUNTEER;

	const [reportTarget, setReportTarget] = useState<GuardianshipItem | null>(null);
	const [cancelTarget, setCancelTarget] = useState<GuardianshipItem | null>(null);

	const canCancel = useCanCancelGuardianship();
	const canReport = canSendGuardianshipReport(role, session?.user.id, { animalCuratorId });

	const query = useGuardianshipsList(
		{
			animalId,
			status: GuardianshipStatusEnum.ACTIVE,
			page: 1,
			perPage: 1,
			sort: 'startedAt:desc'
		},
		{ enabled: isStaff }
	);

	if (!isStaff) {
		return null;
	}

	const current: GuardianshipItem | null = query.data?.data?.[0] ?? null;

	const renderBody = (): JSX.Element => {
		if (query.isPending) {
			return (
				<div className="flex items-center justify-center py-6 text-(--color-text-secondary)">
					<Loader2 className="animate-spin" size={20} />
				</div>
			);
		}

		if (query.isError) {
			return (
				<div className="flex items-center gap-2 text-sm text-rose-300">
					<AlertTriangle size={16} />
					Не удалось загрузить данные об опекунстве.
				</div>
			);
		}

		if (!current) {
			return (
				<div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-bg-primary) p-4 text-sm text-(--color-text-secondary)">
					<p className="flex items-center gap-2 text-(--color-text-primary) font-medium">
						<Info size={16} className="text-(--color-brand-orange)" />
						Опекун пока не найден
					</p>
					<p className="mt-1">
						Поделитесь страницей животного, чтобы кто-нибудь оформил опекунство — при появлении нового
						опекуна он появится здесь.
					</p>
				</div>
			);
		}

		const privilegesActive =
			current.guardianPrivilegesUntil != null && dayjs(current.guardianPrivilegesUntil).isAfter(dayjs());
		const canCancelThis = canCancel && current.status !== GuardianshipStatusEnum.CANCELLED;
		const canReportThis = canReport && current.status !== GuardianshipStatusEnum.CANCELLED;

		return (
			<div className="flex flex-col gap-4">
				<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<Link
								to={ROUTES.guardian.replace(':id', current.guardian.id)}
								className="text-base font-semibold hover:underline truncate">
								{current.guardian.name}
							</Link>
							<GuardianshipStatusBadge status={current.status} />
							{current.guardian.telegramUnreachable && (
								<span className="inline-flex items-center gap-1 text-[11px] text-amber-300">
									<AlertTriangle size={12} />
									Telegram недоступен
								</span>
							)}
						</div>
						<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--color-text-secondary)">
							{current.guardian.email && <span className="truncate">{current.guardian.email}</span>}
							{current.guardian.telegram && (
								<a
									href={getUserTelegramLink(current.guardian.telegram)}
									target="_blank"
									rel="noopener noreferrer"
									className="underline">
									{current.guardian.telegram}
								</a>
							)}
						</div>
					</div>
					<div className="flex flex-wrap md:justify-end gap-2 shrink-0">
						{canReportThis && (
							<Button
								type="button"
								appearance="primary"
								className="mt-0 w-auto px-3 py-1.5 text-xs"
								onClick={() => setReportTarget(current)}>
								<MessageSquarePlus size={14} />
								Отправить отчёт
							</Button>
						)}
						<Link
							to={ROUTES.guardian.replace(':id', current.guardian.id)}
							className="inline-flex items-center gap-1 justify-center text-xs text-(--color-text-secondary) hover:text-(--color-brand-orange) px-3 py-1.5 border border-(--color-border) rounded-lg">
							<ExternalLink size={12} />
							Профиль
						</Link>
						{canCancelThis && (
							<button
								type="button"
								onClick={() => setCancelTarget(current)}
								className="inline-flex items-center gap-1 justify-center text-xs text-rose-300 hover:text-rose-200 px-3 py-1.5 border border-rose-500/30 rounded-lg">
								<XCircle size={12} />
								Отменить
							</button>
						)}
					</div>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
					<InfoBlock label="Активно с" value={formatDate(current.startedAt)} />
					<InfoBlock label="Оплачено до" value={formatDate(current.paidPeriodEndAt)} />
					<InfoBlock label="Сумма" value={formatMoney(current.animal.costOfGuardianship)} />
					{current.status === GuardianshipStatusEnum.CANCELLED ? (
						<InfoBlock label="Отменено" value={formatDate(current.cancelledAt)} />
					) : (
						<InfoBlock
							label="Статус"
							value={current.status === GuardianshipStatusEnum.ACTIVE ? 'Активно' : 'Ожидает оплаты'}
						/>
					)}
				</div>

				{current.status === GuardianshipStatusEnum.CANCELLED && privilegesActive && (
					<p className="inline-flex items-center gap-1 text-[11px] text-amber-300">
						<Send size={12} />
						Отчёт ещё дойдёт: доступ сохраняется до {formatDate(current.guardianPrivilegesUntil)}
					</p>
				)}
			</div>
		);
	};

	return (
		<section className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-4">
			<header className="flex items-center justify-between gap-3 flex-wrap">
				<h2 className="text-xl font-semibold">Опекун</h2>
				{current && (
					<Link
						to={`${ROUTES.guardianshipsAll}?animalId=${animalId}`}
						className="text-xs text-(--color-text-secondary) hover:text-(--color-brand-orange) underline">
						Все опекунства животного
					</Link>
				)}
			</header>

			{renderBody()}

			{reportTarget && (
				<SendReportModal
					animalId={animalId}
					animalName={animalName}
					guardianName={reportTarget.guardian.name}
					onClose={() => setReportTarget(null)}
				/>
			)}

			{cancelTarget && (
				<CancelGuardianshipModal
					guardianshipId={cancelTarget.id}
					animalName={animalName}
					guardianName={cancelTarget.guardian.name}
					onClose={() => setCancelTarget(null)}
				/>
			)}
		</section>
	);
};

interface InfoBlockProps {
	label: string;
	value: string;
}

const InfoBlock = ({ label, value }: InfoBlockProps): JSX.Element => (
	<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
		<p className="text-(--color-text-secondary)">{label}</p>
		<p className="font-semibold text-sm">{value}</p>
	</div>
);
