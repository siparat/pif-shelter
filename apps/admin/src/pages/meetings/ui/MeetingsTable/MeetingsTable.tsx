import { MeetingRequestStatusEnum } from '@pif/shared';
import dayjs from 'dayjs';
import { CheckCircle2, ExternalLink, PawPrintIcon, XCircle } from 'lucide-react';
import { JSX, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MeetingRequestItem, MeetingRequestStatusBadge } from '../../../../entities/meeting-request';
import { ROUTES } from '../../../../shared/config';
import { getMediaUrl } from '../../../../shared/lib';
import { Button } from '../../../../shared/ui';

interface Props {
	meetings: MeetingRequestItem[];
	emptyState?: ReactNode;
	onConfirm: (meeting: MeetingRequestItem) => void;
	onReject: (meeting: MeetingRequestItem) => void;
}

const formatDateTime = (value: string): string => dayjs(value).format('DD.MM.YYYY HH:mm');

const isUpcoming24h = (meetingAt: string): boolean => {
	const meetingTs = new Date(meetingAt).getTime();
	const now = Date.now();
	const in24h = now + 24 * 60 * 60 * 1000;
	return meetingTs >= now && meetingTs <= in24h;
};

const MeetingAnimalAvatar = ({
	name,
	avatarUrl,
	size
}: {
	name: string;
	avatarUrl: string | null;
	size: number;
}): JSX.Element => {
	if (avatarUrl) {
		return (
			<div
				className="overflow-hidden rounded-[18%] bg-(--color-bg-primary)"
				style={{ width: size, height: size }}>
				<img
					src={
						avatarUrl.startsWith('http') || avatarUrl.startsWith('blob:')
							? avatarUrl
							: getMediaUrl(avatarUrl)
					}
					alt={name}
					className="w-full h-full object-cover"
				/>
			</div>
		);
	}
	return (
		<div
			className="flex items-center justify-center overflow-hidden rounded-[18%] bg-(--color-bg-primary)"
			style={{ width: size, height: size }}>
			<PawPrintIcon size={28} strokeWidth={1.5} />
		</div>
	);
};

export const MeetingsTable = ({ meetings, emptyState, onConfirm, onReject }: Props): JSX.Element => {
	if (meetings.length === 0 && emptyState) {
		return <>{emptyState}</>;
	}

	return (
		<>
			<div className="hidden md:block overflow-auto rounded-2xl border border-(--color-border) bg-(--color-bg-secondary)">
				<table className="w-full min-w-[980px] text-sm">
					<thead>
						<tr className="text-left text-(--color-text-secondary) border-b border-(--color-border)">
							<th className="p-3">Животное</th>
							<th className="p-3">Заявитель</th>
							<th className="p-3">Дата встречи</th>
							<th className="p-3">Куратор</th>
							<th className="p-3">Статус</th>
							<th className="p-3">Действия</th>
						</tr>
					</thead>
					<tbody>
						{meetings.map((item) => {
							const canAct = item.status === MeetingRequestStatusEnum.NEW;
							const upcoming24h = isUpcoming24h(item.meetingAt);
							return (
								<tr
									key={item.id}
									className={`border-b border-(--color-border) last:border-0 align-top ${upcoming24h ? 'bg-sky-500/8' : ''}`}>
									<td className="p-3">
										<div className="flex items-center gap-3">
											<Link to={ROUTES.animalDetails.replace(':id', item.animal.id)}>
												<MeetingAnimalAvatar
													name={item.animal.name}
													avatarUrl={item.animal.avatarUrl}
													size={44}
												/>
											</Link>
											<div>
												<Link
													to={ROUTES.animalDetails.replace(':id', item.animal.id)}
													className="font-semibold hover:underline">
													{item.animal.name}
												</Link>
												<div className="text-xs text-(--color-text-secondary)">
													Карточка животного
												</div>
											</div>
										</div>
									</td>
									<td className="p-3">
										<div className="font-semibold">{item.name}</div>
										<div className="text-xs text-(--color-text-secondary)">{item.phone}</div>
										{item.email && (
											<div className="text-xs text-(--color-text-secondary)">{item.email}</div>
										)}
									</td>
									<td className="p-3 whitespace-nowrap">{formatDateTime(item.meetingAt)}</td>
									<td className="p-3">
										<Link
											to={ROUTES.user.replace(':id', item.curator.id)}
											className="font-semibold hover:underline">
											{item.curator.name ?? 'Без имени'}
										</Link>
										{item.curator.email && (
											<div className="text-xs text-(--color-text-secondary)">
												{item.curator.email}
											</div>
										)}
									</td>
									<td className="p-3">
										<MeetingRequestStatusBadge status={item.status} />
									</td>
									<td className="p-3">
										<div className="flex flex-col gap-2 items-start">
											<Link
												to={ROUTES.meetingDetails.replace(':id', item.id)}
												className="inline-flex items-center gap-1 text-xs text-(--color-text-secondary) hover:text-(--color-brand-orange)">
												<ExternalLink size={12} />
												Открыть
											</Link>
											{canAct && (
												<>
													<Button
														type="button"
														appearance="primary"
														className="mt-0 w-auto px-3 py-1.5 text-xs"
														onClick={() => onConfirm(item)}>
														<CheckCircle2 size={14} />
														Подтвердить
													</Button>
													<button
														type="button"
														onClick={() => onReject(item)}
														className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200">
														<XCircle size={12} />
														Отклонить
													</button>
												</>
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
				{meetings.map((item) => {
					const canAct = item.status === MeetingRequestStatusEnum.NEW;
					const upcoming24h = isUpcoming24h(item.meetingAt);
					return (
						<div
							key={item.id}
							className={`rounded-2xl border p-4 space-y-3 ${
								upcoming24h
									? 'border-sky-500/35 bg-sky-500/10'
									: 'border-(--color-border) bg-(--color-bg-secondary)'
							}`}>
							<div className="flex items-start gap-3">
								<Link to={ROUTES.animalDetails.replace(':id', item.animal.id)}>
									<MeetingAnimalAvatar
										name={item.animal.name}
										avatarUrl={item.animal.avatarUrl}
										size={64}
									/>
								</Link>
								<div className="flex-1">
									<Link
										to={ROUTES.animalDetails.replace(':id', item.animal.id)}
										className="font-semibold hover:underline">
										{item.animal.name}
									</Link>
									<p className="text-xs text-(--color-text-secondary)">Карточка животного</p>
									<div className="mt-2">
										<MeetingRequestStatusBadge status={item.status} />
									</div>
								</div>
							</div>
							<dl className="grid grid-cols-2 gap-2 text-xs">
								<div>
									<dt className="text-(--color-text-secondary)">Заявитель</dt>
									<dd className="font-medium">{item.name}</dd>
									<dd className="text-(--color-text-secondary)">{item.phone}</dd>
								</div>
								<div>
									<dt className="text-(--color-text-secondary)">Встреча</dt>
									<dd>{formatDateTime(item.meetingAt)}</dd>
								</div>
							</dl>
							<div className="flex flex-wrap gap-2">
								<Link
									to={ROUTES.meetingDetails.replace(':id', item.id)}
									className="inline-flex items-center gap-1 text-xs text-(--color-text-secondary) hover:text-(--color-brand-orange) px-3 py-1.5 border border-(--color-border) rounded-lg">
									<ExternalLink size={12} />
									Открыть
								</Link>
								{canAct && (
									<>
										<Button
											type="button"
											appearance="primary"
											className="mt-0 px-3 py-1.5 text-xs"
											onClick={() => onConfirm(item)}>
											<CheckCircle2 size={14} />
											Подтвердить
										</Button>
										<button
											type="button"
											onClick={() => onReject(item)}
											className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 px-3 py-1.5 border border-rose-500/40 rounded-lg">
											<XCircle size={12} />
											Отклонить
										</button>
									</>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
};
