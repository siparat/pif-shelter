import { GuardianshipStatusEnum, GuardianshipStatusNames } from '@pif/shared';
import { Search, X } from 'lucide-react';
import { JSX, useEffect, useRef, useState } from 'react';
import { useVolunteers } from '../../../../entities/volunteer';
import { Input, Select } from '../../../../shared/ui';

interface Props {
	status?: GuardianshipStatusEnum;
	curatorId?: string;
	search?: string;
	onStatusChange: (status?: GuardianshipStatusEnum) => void;
	onCuratorChange: (curatorId?: string) => void;
	onSearchChange: (search?: string) => void;
	onReset: () => void;
}

const SEARCH_DEBOUNCE_MS = 400;

export const GuardianshipsFilters = ({
	status,
	curatorId,
	search,
	onStatusChange,
	onCuratorChange,
	onSearchChange,
	onReset
}: Props): JSX.Element => {
	const { data: volunteers = [] } = useVolunteers();

	const [searchDraft, setSearchDraft] = useState(search ?? '');
	const didSyncRef = useRef(false);

	useEffect(() => {
		if (!didSyncRef.current) {
			didSyncRef.current = true;
			return;
		}
		setSearchDraft(search ?? '');
	}, [search]);

	useEffect(() => {
		const current = searchDraft.trim();
		const external = search ?? '';
		if (current === external) {
			return;
		}
		const timeout = setTimeout(() => {
			onSearchChange(current.length > 0 ? current : undefined);
		}, SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(timeout);
	}, [searchDraft, search, onSearchChange]);

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

	const handleClearSearch = (): void => {
		setSearchDraft('');
		onSearchChange(undefined);
	};

	return (
		<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-5 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_auto] gap-3 items-end">
			<div className="relative">
				<Input
					label="Поиск опекуна"
					placeholder="Имя, email или Telegram"
					value={searchDraft}
					onChange={(event) => setSearchDraft(event.target.value)}
					Icon={Search}
					small
				/>
				{searchDraft.length > 0 && (
					<button
						type="button"
						onClick={handleClearSearch}
						className="absolute right-3 top-[38px] text-(--color-text-secondary) hover:text-(--color-text-primary)"
						aria-label="Очистить поиск">
						<X size={16} />
					</button>
				)}
			</div>
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
