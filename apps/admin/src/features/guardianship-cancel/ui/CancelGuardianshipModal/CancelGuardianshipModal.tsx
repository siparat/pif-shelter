import { AlertTriangle } from 'lucide-react';
import { FormEvent, JSX, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useCancelGuardianshipMutation } from '../../../../entities/guardianship';
import { getErrorMessage } from '../../../../shared/api';
import { Button, Modal, Textarea } from '../../../../shared/ui';

interface Props {
	guardianshipId: string;
	animalName?: string;
	guardianName?: string;
	onClose: () => void;
	onSuccess?: () => void;
}

export const CancelGuardianshipModal = ({
	guardianshipId,
	animalName,
	guardianName,
	onClose,
	onSuccess
}: Props): JSX.Element => {
	const [reason, setReason] = useState('');
	const [error, setError] = useState<string | null>(null);
	const mutation = useCancelGuardianshipMutation();

	const handleSubmit = async (event: FormEvent): Promise<void> => {
		event.preventDefault();
		const trimmed = reason.trim();
		if (trimmed.length < 3) {
			setError('Укажите причину (минимум 3 символа).');
			return;
		}
		setError(null);
		try {
			await mutation.mutateAsync({ guardianshipId, reason: trimmed });
			toast.success('Опекунство отменено');
			onSuccess?.();
			onClose();
		} catch (err) {
			const message = await getErrorMessage(err);
			toast.error(message);
			setError(message);
		}
	};

	return (
		<Modal title="Отменить опекунство" onClose={onClose}>
			<form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
				<div className="flex gap-3 items-start rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
					<AlertTriangle className="text-amber-300 shrink-0 mt-0.5" size={20} />
					<div className="text-sm space-y-1">
						<p className="font-semibold text-amber-200">Это действие необратимо.</p>
						<p className="text-(--color-text-secondary)">
							Подписка на оплату будет отменена в эквайринге, опекун получит e-mail и Telegram-уведомление
							об отмене. Портальный доступ останется до конца оплаченного периода (если он был).
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
					{guardianName && (
						<div>
							<dt className="text-(--color-text-secondary)">Опекун</dt>
							<dd className="font-semibold">{guardianName}</dd>
						</div>
					)}
				</dl>

				<Textarea
					label="Причина отмены"
					placeholder="Например: возврат по заявлению опекуна, технический сбой, ошибка оператора."
					rows={4}
					maxLength={255}
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
						Закрыть
					</Button>
					<Button
						type="submit"
						appearance="red"
						className="mt-0 md:w-auto px-6 py-2"
						isLoading={mutation.isPending}>
						Отменить опекунство
					</Button>
				</div>
			</form>
		</Modal>
	);
};
