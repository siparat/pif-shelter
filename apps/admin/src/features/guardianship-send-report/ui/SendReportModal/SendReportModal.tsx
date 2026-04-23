import { PostVisibilityEnum } from '@pif/shared';
import { Info } from 'lucide-react';
import { JSX } from 'react';
import { toast } from 'react-hot-toast';
import { CreatePostPayload, useCreatePostMutation } from '../../../../entities/post';
import { PostEditor } from '../../../../features/post-editor';
import { getErrorMessage } from '../../../../shared/api';
import { Modal } from '../../../../shared/ui';

interface Props {
	animalId: string;
	animalName: string;
	guardianName?: string;
	onClose: () => void;
	onSuccess?: () => void;
}

export const SendReportModal = ({ animalId, animalName, guardianName, onClose, onSuccess }: Props): JSX.Element => {
	const createMutation = useCreatePostMutation();

	const handleSubmit = async (payload: CreatePostPayload): Promise<void> => {
		try {
			await createMutation.mutateAsync({
				...payload,
				visibility: PostVisibilityEnum.PRIVATE
			});
			toast.success('Отчёт отправлен опекуну');
			onSuccess?.();
			onClose();
		} catch (err) {
			const message = await getErrorMessage(err);
			toast.error(message);
		}
	};

	return (
		<Modal title={`Отчёт опекуну: ${animalName}`} onClose={onClose}>
			<div className="space-y-5">
				<div className="flex gap-3 items-start rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm">
					<Info className="text-sky-300 shrink-0 mt-0.5" size={20} />
					<div className="space-y-1">
						<p className="font-semibold text-sky-200">Это приватный пост</p>
						<p className="text-(--color-text-secondary)">
							Будет виден только опекуну{guardianName ? ` (${guardianName})` : ''} и сотрудникам приюта.{' '}
							После публикации опекун получит уведомление в Telegram со всем содержимым отчёта и медиа.
						</p>
					</div>
				</div>

				<PostEditor
					animalId={animalId}
					defaultValues={{ visibility: PostVisibilityEnum.PRIVATE }}
					hideVisibility
					onSubmit={handleSubmit}
					onCancel={onClose}
					submitLabel="Отправить отчёт"
					cancelLabel="Закрыть"
					isSubmitting={createMutation.isPending}
				/>
			</div>
		</Modal>
	);
};
