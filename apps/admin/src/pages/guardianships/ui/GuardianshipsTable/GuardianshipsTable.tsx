import { AnimalSpeciesNames, GuardianshipStatusEnum } from '@pif/shared';
import dayjs from 'dayjs';
import { AlertTriangle, ExternalLink, MessageSquarePlus, Send, XCircle } from 'lucide-react';
import { JSX, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimalAvatar } from '../../../../entities/animal';
import {
	canSendGuardianshipReport,
	GuardianshipItem,
	GuardianshipStatusBadge,
	useCanCancelGuardianship
} from '../../../../entities/guardianship';
import { useSession } from '../../../../entities/session/model/hooks';
import { ROUTES } from '../../../../shared/config';
import { getUserTelegramLink } from '../../../../shared/lib';
import { Button } from '../../../../shared/ui';

interface Props {
	guardianships: GuardianshipItem[];
	emptyState?: ReactNode;
	onSendReport: (guardianship: GuardianshipItem) => void;
	onCancel: (guardianship: GuardianshipItem) => void;
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

export const GuardianshipsTable = ({ guardianships, emptyState, onSendReport, onCancel }: Props): JSX.Element => {
	const { data: session } = useSession();
	const canCancel = useCanCancelGuardianship();

	if (guardianships.length === 0 && emptyState) {
		return <>{emptyState}</>;
	}

	return (
		<>
			<div className="hidden md:block overflow-auto rounded-2xl border border-(--color-border) bg-(--color-bg-secondary)">
				<table className="w-full min-w-[1000px] text-sm">
					<thead>
						<tr className="text-left text-(--color-text-secondary) border-b border-(--color-border)">
							<th className="p-3">Животное</th>
							<th className="p-3">Статус</th>
							<th className="p-3">Опекун</th>
							<th className="p-3">Активно с</th>
							<th className="p-3">Оплачено до</th>
							<th className="p-3">Сумма</th>
							<th className="p-3">Действия</th>
						</tr>
					</thead>
					<tbody>
						{guardianships.map((item) => {
							const canReport = canSendGuardianshipReport(session?.user.role, session?.user.id, {
								animalCuratorId: item.animal.curatorId
							});
							const canCancelThis = canCancel && item.status !== GuardianshipStatusEnum.CANCELLED;
							const privilegesActive =
								item.guardianPrivilegesUntil != null &&
								dayjs(item.guardianPrivilegesUntil).isAfter(dayjs());

							return (
								<tr key={item.id} className="border-b border-(--color-border) last:border-0 align-top">
									<td className="p-3">
										<div className="flex items-center gap-3">
											<Link to={ROUTES.animalDetails.replace(':id', item.animal.id)}>
												<AnimalAvatar
													className="shrink-0"
													animal={{
														avatarUrl: item.animal.avatarUrl,
														name: item.animal.name,
														species: item.animal.species
													}}
													width={44}
													height={44}
													rounded
												/>
											</Link>
											<div>
												<Link
													to={ROUTES.animalDetails.replace(':id', item.animal.id)}
													className="font-semibold hover:underline">
													{item.animal.name}
												</Link>
												<div className="text-xs text-(--color-text-secondary)">
													{AnimalSpeciesNames[item.animal.species]}
												</div>
											</div>
										</div>
									</td>
									<td className="p-3 space-y-1">
										<GuardianshipStatusBadge status={item.status} />
										{item.status === GuardianshipStatusEnum.CANCELLED && privilegesActive && (
											<div className="pl-1 text-[11px] text-amber-300">
												Доступ до {formatDate(item.guardianPrivilegesUntil)}
											</div>
										)}
									</td>
									<td className="p-3">
										<Link
											to={ROUTES.guardian.replace(':id', item.guardian.id)}
											className="font-semibold hover:underline">
											{item.guardian.name}
										</Link>
										<div>
											<a
												href={getUserTelegramLink(item.guardian.telegram)}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs text-(--color-text-secondary) underline">
												{item.guardian.telegram}
											</a>
										</div>
										{item.guardian.telegramUnreachable && (
											<div className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-300">
												<AlertTriangle size={12} />
												Telegram недоступен
											</div>
										)}
									</td>
									<td className="p-3 whitespace-nowrap">{formatDate(item.startedAt)}</td>
									<td className="p-3 whitespace-nowrap">{formatDate(item.paidPeriodEndAt)}</td>
									<td className="p-3 whitespace-nowrap">
										{formatMoney(item.animal.costOfGuardianship)}
									</td>
									<td className="p-3">
										<div className="flex flex-col gap-2 items-start">
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
												className="inline-flex items-center gap-1 text-xs text-(--color-text-secondary) hover:text-(--color-brand-orange)">
												<ExternalLink size={12} />
												Профиль
											</Link>
											{canCancelThis && (
												<button
													type="button"
													onClick={() => onCancel(item)}
													className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200">
													<XCircle size={12} />
													Отменить
												</button>
											)}
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<div className="md:hidden grid grid-cols-1 gap-3">
				{guardianships.map((item) => {
					const canReport = canSendGuardianshipReport(session?.user.role, session?.user.id, {
						animalCuratorId: item.animal.curatorId
					});
					const canCancelThis = canCancel && item.status !== GuardianshipStatusEnum.CANCELLED;

					return (
						<div
							key={item.id}
							className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 space-y-3">
							<div className="flex items-start gap-3">
								<Link to={ROUTES.animalDetails.replace(':id', item.animal.id)}>
									<AnimalAvatar
										animal={{
											avatarUrl: item.animal.avatarUrl,
											name: item.animal.name,
											species: item.animal.species
										}}
										width={64}
										height={64}
										rounded
									/>
								</Link>
								<div className="flex-1">
									<Link
										to={ROUTES.animalDetails.replace(':id', item.animal.id)}
										className="font-semibold hover:underline">
										{item.animal.name}
									</Link>
									<p className="text-xs text-(--color-text-secondary)">
										{AnimalSpeciesNames[item.animal.species]}
									</p>
									<div className="mt-2 flex flex-wrap gap-2 items-center">
										<GuardianshipStatusBadge status={item.status} />
										<span className="text-xs text-(--color-text-secondary)">
											{formatMoney(item.animal.costOfGuardianship)} / мес
										</span>
									</div>
								</div>
							</div>
							<dl className="grid grid-cols-2 gap-2 text-xs">
								<div>
									<dt className="text-(--color-text-secondary)">Опекун</dt>
									<dd className="font-medium">
										<Link
											to={ROUTES.guardian.replace(':id', item.guardian.id)}
											className="hover:underline text-(--color-text-primary)">
											{item.guardian.name}
										</Link>
									</dd>
									<dd className="text-(--color-text-secondary) max-md:mt-3">
										<a
											href={getUserTelegramLink(item.guardian.telegram)}
											target="_blank"
											rel="noopener noreferrer"
											className="underline">
											{item.guardian.telegram ?? '—'}
										</a>
									</dd>
								</div>
								<div>
									<dt className="text-(--color-text-secondary)">Активно с</dt>
									<dd>{formatDate(item.startedAt)}</dd>
									<dt className="text-(--color-text-secondary) mt-1">Оплачено до</dt>
									<dd>{formatDate(item.paidPeriodEndAt)}</dd>
								</div>
							</dl>
							{item.guardian.telegramUnreachable && (
								<div className="flex items-center gap-1 text-xs text-amber-300">
									<AlertTriangle size={14} />
									Telegram недоступен — уведомления не приходят
								</div>
							)}
							<div className="flex flex-wrap gap-2">
								{canReport && item.status !== GuardianshipStatusEnum.CANCELLED && (
									<Button
										type="button"
										appearance="primary"
										className="mt-0 px-3 py-1.5 text-xs"
										onClick={() => onSendReport(item)}>
										<Send size={14} />
										Отчёт
									</Button>
								)}
								<Link
									to={ROUTES.animalDetails.replace(':id', item.animal.id)}
									className="inline-flex items-center gap-1 text-xs text-(--color-text-secondary) hover:text-(--color-brand-orange) px-3 py-1.5 border border-(--color-border) rounded-lg">
									<ExternalLink size={12} />
									Профиль
								</Link>
								{canCancelThis && (
									<button
										type="button"
										onClick={() => onCancel(item)}
										className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 px-3 py-1.5 border border-rose-500/30 rounded-lg">
										<XCircle size={12} />
										Отменить
									</button>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
};
