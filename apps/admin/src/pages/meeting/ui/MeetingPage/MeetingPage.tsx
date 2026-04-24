import { MeetingRequestStatusEnum } from '@pif/shared';
import dayjs from 'dayjs';
import { ArrowLeft, Clock3 } from 'lucide-react';
import { JSX, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MeetingRequestStatusBadge, useMeetingRequestById } from '../../../../entities/meeting-request';
import { ConfirmMeetingRequestModal } from '../../../../features/meeting-request-confirm';
import { RejectMeetingRequestModal } from '../../../../features/meeting-request-reject';
import { ROUTES } from '../../../../shared/config';
import { Button, ErrorState, PageTitle } from '../../../../shared/ui';

const formatDateTime = (value: string | null | undefined): string =>
	value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '—';

export const MeetingPage = (): JSX.Element => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isRejectOpen, setIsRejectOpen] = useState(false);
	const query = useMeetingRequestById(id, { enabled: Boolean(id) });

	if (!id) {
		return <ErrorState description="Некорректный идентификатор заявки." onRetry={() => navigate(-1)} />;
	}

	if (query.isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Clock3 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (query.isError || !query.data) {
		return (
			<ErrorState
				description={query.error?.message ?? 'Не удалось загрузить заявку.'}
				onRetry={() => void query.refetch()}
			/>
		);
	}

	const meeting = query.data;
	const canAct = meeting.status === MeetingRequestStatusEnum.NEW;

	return (
		<div className="space-y-6 pb-10">
			<PageTitle title={`Заявка ${meeting.name}`} subtitle="Детали заявки на встречу.">
				<Button
					type="button"
					appearance="ghost"
					className="mt-0 md:w-auto px-6 py-2"
					onClick={() => navigate(-1)}>
					<ArrowLeft size={16} />
					Назад
				</Button>
			</PageTitle>

			<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-4">
				<div className="flex items-center justify-between gap-3">
					<div className="space-y-1">
						<p className="text-xs text-(--color-text-secondary)">Статус</p>
						<MeetingRequestStatusBadge status={meeting.status} />
					</div>
					<Link
						to={ROUTES.animalDetails.replace(':id', meeting.animal.id)}
						className="text-sm text-(--color-brand-orange) hover:underline">
						Открыть карточку животного
					</Link>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
					<div>
						<p className="text-(--color-text-secondary) text-xs">Животное</p>
						<p>{meeting.animal.name}</p>
					</div>
					<div>
						<p className="text-(--color-text-secondary) text-xs">Дата встречи</p>
						<p>{formatDateTime(meeting.meetingAt)}</p>
					</div>
					<div>
						<p className="text-(--color-text-secondary) text-xs">Заявитель</p>
						<p>{meeting.name}</p>
					</div>
					<div>
						<p className="text-(--color-text-secondary) text-xs">Телефон</p>
						<p>{meeting.phone}</p>
					</div>
					<div>
						<p className="text-(--color-text-secondary) text-xs">Email</p>
						<p>{meeting.email ?? '—'}</p>
					</div>
					<div>
						<p className="text-(--color-text-secondary) text-xs">Куратор</p>
						<p>{meeting.curator.name ?? '—'}</p>
					</div>
					<div>
						<p className="text-(--color-text-secondary) text-xs">Создано</p>
						<p>{formatDateTime(meeting.createdAt)}</p>
					</div>
					<div>
						<p className="text-(--color-text-secondary) text-xs">Обновлено</p>
						<p>{formatDateTime(meeting.updatedAt ?? null)}</p>
					</div>
				</div>

				<div className="pt-2 border-t border-(--color-border)">
					<p className="text-(--color-text-secondary) text-xs mb-1">Комментарий</p>
					<p>{meeting.comment ?? 'Комментарий не указан'}</p>
				</div>

				{meeting.rejectionReason && (
					<div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm">
						<p className="text-xs text-rose-200 mb-1">Причина отклонения</p>
						<p>{meeting.rejectionReason}</p>
					</div>
				)}

				{canAct && (
					<div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-(--color-border)">
						<Button
							type="button"
							className="mt-0 md:w-auto px-6 py-2"
							onClick={() => setIsConfirmOpen(true)}>
							Подтвердить
						</Button>
						<Button
							type="button"
							appearance="red"
							className="mt-0 md:w-auto px-6 py-2"
							onClick={() => setIsRejectOpen(true)}>
							Отклонить
						</Button>
					</div>
				)}
			</div>

			{isConfirmOpen && (
				<ConfirmMeetingRequestModal
					meetingRequestId={meeting.id}
					animalName={meeting.animal.name}
					applicantName={meeting.name}
					onClose={() => setIsConfirmOpen(false)}
					onSuccess={() => void query.refetch()}
				/>
			)}

			{isRejectOpen && (
				<RejectMeetingRequestModal
					meetingRequestId={meeting.id}
					animalName={meeting.animal.name}
					applicantName={meeting.name}
					onClose={() => setIsRejectOpen(false)}
					onSuccess={() => void query.refetch()}
				/>
			)}
		</div>
	);
};

export default MeetingPage;
