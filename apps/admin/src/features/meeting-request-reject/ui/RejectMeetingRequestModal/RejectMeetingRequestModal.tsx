import { rejectMeetingRequestDtoSchema } from '@pif/contracts';
import { AlertTriangle } from 'lucide-react';
import { SubmitEvent, JSX, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRejectMeetingRequestMutation } from '../../../../entities/meeting-request';
import { getErrorMessage } from '../../../../shared/api';
import { Button, Modal, Textarea } from '../../../../shared/ui';

interface Props {
	meetingRequestId: string;
	animalName?: string;
	applicantName?: string;
	onClose: () => void;
	onSuccess?: () => void;
}

export const RejectMeetingRequestModal = ({
	meetingRequestId,
	animalName,
	applicantName,
	onClose,
	onSuccess
}: Props): JSX.Element => {
	const mutation = useRejectMeetingRequestMutation();
	const [reason, setReason] = useState('');
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (event: SubmitEvent): Promise<void> => {
		event.preventDefault();
		const parsed = rejectMeetingRequestDtoSchema.safeParse({ reason });
		if (!parsed.success) {
			setError('Укажите причину от 1 до 300 символов.');
			return;
		}

		setError(null);
		try {
			await mutation.mutateAsync({
				id: meetingRequestId,
				payload: parsed.data
			});
			toast.success('Заявка отклонена');
			onSuccess?.();
			onClose();
		} catch (err) {
			const message = await getErrorMessage(err);
			toast.error(message);
			setError(message);
		}
	};

	return (
		<Modal title="Отклонить заявку" onClose={onClose}>
			<form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
				<div className="flex gap-3 items-start rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
					<AlertTriangle className="text-rose-300 shrink-0 mt-0.5" size={20} />
					<div className="text-sm space-y-1">
						<p className="font-semibold text-rose-200">Отклонение заявки</p>
						<p className="text-(--color-text-secondary)">
							После отклонения заявка перейдет в статус "Отклонена". Причина будет сохранена в карточке
							заявки.
						</p>
					</div>
				</div>

				<dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
					{animalName && (
						<div>
							<dt className="text-(--color-text-secondary)">Животное</dt>
							<dd className="font-semibold">{animalName}</dd>
						</div>
					)}
					{applicantName && (
						<div>
							<dt className="text-(--color-text-secondary)">Заявитель</dt>
							<dd className="font-semibold">{applicantName}</dd>
						</div>
					)}
				</dl>

				<Textarea
					label="Причина отклонения"
					placeholder="Например: не удалось согласовать время или заявка неактуальна."
					rows={4}
					maxLength={300}
					value={reason}
					onChange={(event) => setReason(event.target.value)}
					error={error ?? undefined}
					disabled={mutation.isPending}
				/>

				<div className="flex flex-col md:flex-row justify-end gap-3">
					<Button
						type="button"
						appearance="ghost"
						className="mt-0 md:w-auto px-6 py-2"
						onClick={onClose}
						disabled={mutation.isPending}>
						Отмена
					</Button>
					<Button
						type="submit"
						appearance="red"
						className="mt-0 md:w-auto px-6 py-2"
						isLoading={mutation.isPending}>
						Отклонить
					</Button>
				</div>
			</form>
		</Modal>
	);
};
