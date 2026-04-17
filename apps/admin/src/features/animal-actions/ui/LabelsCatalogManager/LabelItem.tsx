import { JSX, useState } from 'react';
import toast from 'react-hot-toast';
import { useDeleteAnimalLabelMutation, useUpdateAnimalLabelMutation } from '../../../../entities/animal';
import { getErrorMessage } from '../../../../shared/api';
import { Button } from '../../../../shared/ui';

interface Props {
	id: string;
	name: string;
	color: string;
}

export const LabelItem = ({ id, name, color }: Props): JSX.Element => {
	const [draftName, setDraftName] = useState(name);
	const [draftColor, setDraftColor] = useState(color);
	const updateLabel = useUpdateAnimalLabelMutation();
	const deleteLabel = useDeleteAnimalLabelMutation();

	const onSave = async (id: string, name: string, color: string): Promise<void> => {
		try {
			await updateLabel.mutateAsync({ id, payload: { name, color } });
			toast.success('Ярлык обновлен');
		} catch (error) {
			const message = await getErrorMessage(error);
			toast.error(message);
		}
	};

	const onDelete = async (id: string): Promise<void> => {
		if (!window.confirm('Удалить ярлык?')) {
			return;
		}

		try {
			await deleteLabel.mutateAsync(id);
			toast.success('Ярлык удален');
		} catch (error) {
			const message = await getErrorMessage(error);
			toast.error(message);
		}
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-[1fr_100px_auto_auto] gap-2 rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
			<input
				value={draftName}
				onChange={(event) => setDraftName(event.target.value)}
				className="rounded-xl border border-(--color-border) bg-(--color-bg-secondary) py-2 px-3 text-sm"
			/>
			<input
				value={draftColor}
				onChange={(event) => setDraftColor(event.target.value)}
				type="color"
				className="h-10 w-full rounded-xl border border-(--color-border) bg-(--color-bg-secondary) p-1"
			/>
			<Button
				type="button"
				className="mt-0 md:w-auto px-4 py-2"
				onClick={() => onSave(id, draftName.trim(), draftColor)}>
				Сохранить
			</Button>
			<Button type="button" className="mt-0 md:w-auto px-4 py-2" appearance="red" onClick={() => onDelete(id)}>
				Удалить
			</Button>
		</div>
	);
};
