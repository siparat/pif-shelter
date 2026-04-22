import { AlertTriangle } from 'lucide-react';
import { JSX } from 'react';
import { Button, Modal } from '../../../../shared/ui';

interface Props {
	title: string;
	isPending: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export const DeletePostConfirm = ({ title, isPending, onConfirm, onCancel }: Props): JSX.Element => {
	return (
		<Modal title="Удалить пост?" onClose={onCancel}>
			<div className="space-y-5">
				<div className="flex items-start gap-3">
					<div className="shrink-0 rounded-full bg-red-500/15 p-2 text-red-500">
						<AlertTriangle size={20} />
					</div>
					<div className="space-y-1">
						<p className="text-sm">
							Пост <span className="font-semibold">«{title}»</span> будет удалён безвозвратно.
						</p>
						<p className="text-xs text-(--color-text-secondary)">
							Все вложения (фото и видео) также будут удалены из хранилища. Отменить удаление нельзя.
						</p>
					</div>
				</div>

				<div className="flex flex-col md:flex-row justify-end gap-3">
					<Button
						type="button"
						appearance="ghost"
						className="mt-0 md:w-auto px-6 py-2"
						onClick={onCancel}
						disabled={isPending}>
						Отменить
					</Button>
					<Button
						type="button"
						appearance="red"
						className="mt-0 md:w-auto px-6 py-2"
						onClick={onConfirm}
						isLoading={isPending}>
						Удалить пост
					</Button>
				</div>
			</div>
		</Modal>
	);
};
