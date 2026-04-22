import { AnimalStatusEnum, AnimalStatusNames } from '@pif/shared';
import { JSX } from 'react';
import { Button, Modal } from '../../../../shared/ui';

interface Props {
	nextStatus: AnimalStatusEnum;
	isPending: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

const DESCRIPTIONS: Record<AnimalStatusEnum, string> = {
	[AnimalStatusEnum.DRAFT]: '',
	[AnimalStatusEnum.PUBLISHED]: '',
	[AnimalStatusEnum.ON_TREATMENT]: '',
	[AnimalStatusEnum.ON_PROBATION]: '',
	[AnimalStatusEnum.ADOPTED]:
		'Животное будет помечено как нашедшее дом и переместится в раздел «Счастливчики». Действие обратимо, но отображение на сайте изменится сразу.',
	[AnimalStatusEnum.RAINBOW]:
		'Это терминальный статус («На радуге»). Карточка уйдёт в архив и будет скрыта с публичной части сайта. Активное опекунство автоматически не отменяется — отмените его отдельно, если требуется.'
};

export const TerminalStatusConfirmModal = ({ nextStatus, isPending, onConfirm, onCancel }: Props): JSX.Element => {
	return (
		<Modal title={`Подтверждение статуса: ${AnimalStatusNames[nextStatus]}`} onClose={onCancel}>
			<div className="space-y-5">
				<p className="text-sm text-(--color-text-secondary) leading-relaxed">{DESCRIPTIONS[nextStatus]}</p>
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
						appearance={nextStatus === AnimalStatusEnum.RAINBOW ? 'red' : 'primary'}
						className="mt-0 md:w-auto px-6 py-2"
						onClick={onConfirm}
						isLoading={isPending}>
						Подтвердить
					</Button>
				</div>
			</div>
		</Modal>
	);
};
