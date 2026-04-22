import { ImageOff } from 'lucide-react';
import { JSX, useState } from 'react';
import { Button, Modal } from '../../../shared/ui';

interface Props {
	previewUrl: string;
	isPending: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export const RemoveGalleryPhotoConfirm = ({ previewUrl, isPending, onConfirm, onCancel }: Props): JSX.Element => {
	const [isBroken, setIsBroken] = useState(false);

	return (
		<Modal title="Удалить фото из галереи?" onClose={onCancel}>
			<div className="space-y-5">
				<div className="flex items-start gap-4 max-md:flex-col">
					<div className="relative w-36 h-36 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg-primary) flex-shrink-0">
						{isBroken ? (
							<div className="absolute inset-0 flex items-center justify-center text-(--color-text-secondary)">
								<ImageOff size={32} />
							</div>
						) : (
							<img
								src={previewUrl}
								alt="Превью удаляемого фото"
								className="absolute inset-0 w-full h-full object-cover"
								onError={() => setIsBroken(true)}
							/>
						)}
					</div>
					<p className="text-sm text-(--color-text-secondary) leading-relaxed">
						Фото будет удалено из галереи. Восстановить удалённое фото невозможно — при необходимости
						загрузите его снова.
					</p>
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
						Удалить фото
					</Button>
				</div>
			</div>
		</Modal>
	);
};
