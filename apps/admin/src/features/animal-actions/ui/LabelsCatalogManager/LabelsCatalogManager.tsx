import { JSX, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAnimalLabels, useCreateAnimalLabelMutation } from '../../../../entities/animal';
import { getErrorMessage } from '../../../../shared/api';
import { Button } from '../../../../shared/ui';
import { LabelItem } from './LabelItem';

export const LabelsCatalogManager = (): JSX.Element => {
	const { data: labels = [], refetch } = useAnimalLabels();
	const createLabel = useCreateAnimalLabelMutation();

	const [newLabelName, setNewLabelName] = useState('');
	const [newLabelColor, setNewLabelColor] = useState('#ffffff');

	const handleCreateLabel = async (): Promise<void> => {
		if (!newLabelName.trim()) {
			toast.error('Введите название ярлыка');
			return;
		}

		try {
			await createLabel.mutateAsync({
				name: newLabelName.trim(),
				color: newLabelColor
			});
			await refetch();
			setNewLabelName('');
			setNewLabelColor('#ffffff');
			toast.success('Ярлык создан');
		} catch (error) {
			const message = await getErrorMessage(error);
			toast.error(message);
		}
	};

	return (
		<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6">
			<h3 className="text-lg font-semibold">Справочник ярлыков</h3>
			<p className="text-sm text-(--color-text-secondary) mt-1">Эти ярлыки доступны для назначения животным.</p>

			<div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-3">
				<input
					value={newLabelName}
					onChange={(event) => setNewLabelName(event.target.value)}
					placeholder="Название ярлыка"
					className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) py-2.5 px-3 text-sm"
				/>
				<input
					value={newLabelColor}
					onChange={(event) => setNewLabelColor(event.target.value)}
					type="color"
					className="h-11 w-full rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-1"
				/>
				<Button type="button" className="mt-0 md:w-auto px-5 py-2" onClick={() => handleCreateLabel()}>
					Добавить
				</Button>
			</div>

			<div className="mt-4 space-y-2">
				{labels.map((label) => (
					<LabelItem key={label.id} id={label.id} name={label.name} color={label.color} />
				))}
			</div>
		</div>
	);
};
