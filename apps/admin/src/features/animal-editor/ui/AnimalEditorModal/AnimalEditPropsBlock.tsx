import { AnimalStatusEnum, AnimalStatusNames } from '@pif/shared';
import { HTMLAttributes, JSX } from 'react';
import { Control, Controller, FieldErrors, UseFormRegister } from 'react-hook-form';
import { useAnimalLabels } from '../../../../entities/animal';
import { useVolunteers } from '../../../../entities/volunteer';
import { cn } from '../../../../shared/lib';
import { Input, Select } from '../../../../shared/ui';
import { AnimalEditorValues } from '../../model/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
	control: Control<AnimalEditorValues>;
	register: UseFormRegister<AnimalEditorValues>;
	setLabels: (labels: string[]) => void;
	selectedLabelIds: string[];
	errors: FieldErrors<AnimalEditorValues>;
}

export const AnimalEditPropsBlock = ({
	control,
	register,
	errors,
	setLabels,
	selectedLabelIds,
	className,
	...props
}: Props): JSX.Element => {
	const { data: volunteers = [] } = useVolunteers();
	const { data: labels = [] } = useAnimalLabels();

	return (
		<div {...props} className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
			<Controller
				control={control}
				name="status"
				render={({ field }) => (
					<Select
						{...field}
						label="Статус"
						options={Object.values(AnimalStatusEnum).map((value) => ({
							value,
							label: AnimalStatusNames[value]
						}))}
					/>
				)}
			/>
			<Controller
				control={control}
				name="curatorId"
				render={({ field }) => (
					<Select
						{...field}
						onChange={(e) => field.onChange(e.target.value || null)}
						value={field.value ?? ''}
						label="Куратор"
						placeholder="Без куратора"
						options={volunteers.map((volunteer) => ({
							value: volunteer.id,
							label: `${volunteer.name} (${volunteer.position})`
						}))}
					/>
				)}
			/>
			<div>
				<Input
					{...register('costOfGuardianship', { valueAsNumber: true })}
					type="number"
					step={1}
					min={0}
					label="Стоимость опекунства"
					error={errors.costOfGuardianship?.message}
				/>
				<p className="mt-2 text-xs text-(--color-text-secondary)">
					Пустое значение отключит стоимость опекунства.
				</p>
			</div>
			<div className="md:col-span-2 rounded-2xl border border-(--color-border) bg-(--color-bg-primary) p-4">
				<p className="font-semibold mb-3">Ярлыки</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
					{labels.map((label) => (
						<label
							key={label.id}
							className="flex items-center gap-2 rounded-xl border border-(--color-border) p-2 text-sm">
							<input
								type="checkbox"
								checked={selectedLabelIds.includes(label.id)}
								onChange={(event) => {
									const current = new Set(selectedLabelIds);
									if (event.target.checked) {
										current.add(label.id);
									} else {
										current.delete(label.id);
									}
									setLabels([...current]);
								}}
								className="h-4 w-4 accent-(--color-brand-orange)"
							/>
							<span className="h-3 w-3 rounded-full" style={{ backgroundColor: label.color }} />
							<span>{label.name}</span>
						</label>
					))}
				</div>
			</div>
		</div>
	);
};
