import { GuardianshipStatusEnum, GuardianshipStatusNames } from '@pif/shared';
import { JSX } from 'react';
import { useVolunteers } from '../../../../entities/volunteer';
import { Select } from '../../../../shared/ui';

interface Props {
	status?: GuardianshipStatusEnum;
	curatorId?: string;
	onStatusChange: (status?: GuardianshipStatusEnum) => void;
	onCuratorChange: (curatorId?: string) => void;
	onReset: () => void;
}

export const GuardianshipsFilters = ({
	status,
	curatorId,
	onStatusChange,
	onCuratorChange,
	onReset
}: Props): JSX.Element => {
	const { data: volunteers = [] } = useVolunteers();

	const statusOptions = [
		{ value: '', label: 'Все статусы' },
		...Object.values(GuardianshipStatusEnum).map((value) => ({
			value,
			label: GuardianshipStatusNames[value]
		}))
	];

	const curatorOptions = [
		{ value: '', label: 'Любой куратор' },
		...volunteers.map((volunteer) => ({ value: volunteer.id, label: volunteer.name }))
	];

	return (
		<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-5 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
			<Select<string>
				label="Статус"
				options={statusOptions}
				value={status ?? ''}
				onChange={(event) => {
					const value = event.target.value;
					onStatusChange(value ? (value as GuardianshipStatusEnum) : undefined);
				}}
				small
			/>
			<Select<string>
				label="Куратор"
				options={curatorOptions}
				value={curatorId ?? ''}
				onChange={(event) => {
					const value = event.target.value;
					onCuratorChange(value || undefined);
				}}
				small
			/>
			<button
				type="button"
				onClick={onReset}
				className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary) px-3 py-2 rounded-lg border border-(--color-border)">
				Сбросить
			</button>
		</div>
	);
};
