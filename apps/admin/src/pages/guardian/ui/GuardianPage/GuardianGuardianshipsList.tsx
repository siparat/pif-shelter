import { AnimalSpeciesNames, GuardianshipStatusEnum } from '@pif/shared';
import dayjs from 'dayjs';
import { ExternalLink, MessageSquarePlus, XCircle } from 'lucide-react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { AnimalAvatar } from '../../../../entities/animal';
import {
	canSendGuardianshipReport,
	GuardianshipStatusBadge,
	useCanCancelGuardianship
} from '../../../../entities/guardianship';
import { useSession } from '../../../../entities/session/model/hooks';
import { GuardianProfileGuardianship } from '../../../../entities/guardian';
import { ROUTES } from '../../../../shared/config';
import { Button, EmptyState } from '../../../../shared/ui';

interface Props {
	items: GuardianProfileGuardianship[];
	onSendReport: (item: GuardianProfileGuardianship) => void;
	onCancel: (item: GuardianProfileGuardianship) => void;
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

export const GuardianGuardianshipsList = ({ items, onSendReport, onCancel }: Props): JSX.Element => {
	const { data: session } = useSession();
	const canCancel = useCanCancelGuardianship();

	if (items.length === 0) {
		return <EmptyState title="Нет опекунств" description="Этот пользователь пока не оформлял опекунства." />;
	}

	return (
		<div className="grid grid-cols-1 gap-3">
			{items.map((item) => {
				const canReport = canSendGuardianshipReport(session?.user.role, session?.user.id, {
					animalCuratorId: item.animal.curatorId
				});
				const canCancelThis = canCancel && item.status !== GuardianshipStatusEnum.CANCELLED;
				const privilegesActive =
					item.guardianPrivilegesUntil != null && dayjs(item.guardianPrivilegesUntil).isAfter(dayjs());

				return (
					<div
						key={item.id}
						className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-5">
						<div className="flex flex-col md:flex-row md:items-center gap-4">
							<Link to={ROUTES.animalDetails.replace(':id', item.animal.id)} className="shrink-0">
								<AnimalAvatar
									animal={{
										avatarUrl: item.animal.avatarUrl,
										name: item.animal.name,
										species: item.animal.species
									}}
									width={56}
									height={56}
									rounded
								/>
							</Link>

							<div className="flex-1 min-w-0">
								<div className="flex flex-wrap items-center gap-2">
									<Link
										to={ROUTES.animalDetails.replace(':id', item.animal.id)}
										className="font-semibold hover:underline">
										{item.animal.name}
									</Link>
									<span className="text-xs text-(--color-text-secondary)">
										· {AnimalSpeciesNames[item.animal.species]}
									</span>
									<GuardianshipStatusBadge status={item.status} />
								</div>
								<div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-(--color-text-secondary)">
									<div>
										<span className="block">Активно с</span>
										<span className="text-(--color-text-primary)">
											{formatDate(item.startedAt)}
										</span>
									</div>
									<div>
										<span className="block">Оплачено до</span>
										<span className="text-(--color-text-primary)">
											{formatDate(item.paidPeriodEndAt)}
										</span>
									</div>
									<div>
										<span className="block">Сумма</span>
										<span className="text-(--color-text-primary)">
											{formatMoney(item.animal.costOfGuardianship)}
										</span>
									</div>
									{item.status === GuardianshipStatusEnum.CANCELLED && (
										<div>
											<span className="block">Отменено</span>
											<span className="text-(--color-text-primary)">
												{formatDate(item.cancelledAt)}
											</span>
										</div>
									)}
								</div>
								{item.status === GuardianshipStatusEnum.CANCELLED && privilegesActive && (
									<p className="mt-2 text-[11px] text-amber-300">
										Доступ у опекуна сохраняется до {formatDate(item.guardianPrivilegesUntil)}
									</p>
								)}
							</div>

							<div className="flex flex-wrap md:flex-col gap-2 md:shrink-0">
								{canReport && item.status !== GuardianshipStatusEnum.CANCELLED && (
									<Button
										type="button"
										appearance="primary"
										className="mt-0 w-auto px-3 py-1.5 text-xs"
										onClick={() => onSendReport(item)}>
										<MessageSquarePlus size={14} />
										Отчёт
									</Button>
								)}
								<Link
									to={ROUTES.animalDetails.replace(':id', item.animal.id)}
									className="inline-flex items-center gap-1 justify-center text-xs text-(--color-text-secondary) hover:text-(--color-brand-orange) px-3 py-1.5 border border-(--color-border) rounded-lg">
									<ExternalLink size={12} />
									Профиль
								</Link>
								{canCancelThis && (
									<button
										type="button"
										onClick={() => onCancel(item)}
										className="inline-flex items-center gap-1 justify-center text-xs text-rose-300 hover:text-rose-200 px-3 py-1.5 border border-rose-500/30 rounded-lg">
										<XCircle size={12} />
										Отменить
									</button>
								)}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};
