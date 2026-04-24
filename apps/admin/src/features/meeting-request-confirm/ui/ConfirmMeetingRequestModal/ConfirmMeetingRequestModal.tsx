import { AlertTriangle } from 'lucide-react';
import { JSX } from 'react';
import { toast } from 'react-hot-toast';
import { useConfirmMeetingRequestMutation } from '../../../../entities/meeting-request';
import { getErrorMessage } from '../../../../shared/api';
import { Button, Modal } from '../../../../shared/ui';

interface Props {
	meetingRequestId: string;
	animalName?: string;
	applicantName?: string;
	onClose: () => void;
	onSuccess?: () => void;
}

export const ConfirmMeetingRequestModal = ({
	meetingRequestId,
	animalName,
	applicantName,
	onClose,
	onSuccess
}: Props): JSX.Element => {
	const mutation = useConfirmMeetingRequestMutation();

	const handleConfirm = async (): Promise<void> => {
		try {
			await mutation.mutateAsync(meetingRequestId);
			toast.success('Заявка подтверждена');
			onSuccess?.();
			onClose();
		} catch (err) {
			const message = await getErrorMessage(err);
			toast.error(message);
		}
	};

	return (
		<Modal title="Подтвердить заявку" onClose={onClose}>
			<div className="space-y-5">
				<div className="flex gap-3 items-start rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
					<AlertTriangle className="text-emerald-300 shrink-0 mt-0.5" size={20} />
					<div className="text-sm space-y-1">
						<p className="font-semibold text-emerald-200">Подтверждение встречи</p>
						<p className="text-(--color-text-secondary)">
							После подтверждения заявка перейдет в статус "Подтверждена". Повторно подтверждать не
							требуется.
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
						type="button"
						className="mt-0 md:w-auto px-6 py-2"
						onClick={() => void handleConfirm()}
						isLoading={mutation.isPending}>
						Подтвердить
					</Button>
				</div>
			</div>
		</Modal>
	);
};
