import { MeetingRequestStatusEnum } from '@pif/shared';
import { JSX } from 'react';
import { Checkbox, Select } from '../../../shared/ui';

interface Props {
	status?: MeetingRequestStatusEnum;
	sort: 'createdAt:desc' | 'createdAt:asc' | 'meetingAt:asc' | 'meetingAt:desc';
	upcoming24hOnly: boolean;
	onStatusChange: (status?: MeetingRequestStatusEnum) => void;
	onSortChange: (sort: Props['sort']) => void;
	onUpcoming24hOnlyChange: (value: boolean) => void;
	onReset: () => void;
}

const STATUS_LABEL: Record<MeetingRequestStatusEnum, string> = {
	[MeetingRequestStatusEnum.NEW]: 'Новые',
	[MeetingRequestStatusEnum.CONFIRMED]: 'Подтвержденные',
	[MeetingRequestStatusEnum.REJECTED]: 'Отклоненные'
};

export const MeetingsFilters = ({
	status,
	sort,
	upcoming24hOnly,
	onStatusChange,
	onSortChange,
	onUpcoming24hOnlyChange,
	onReset
}: Props): JSX.Element => {
	return (
		<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-5 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
			<Select<string>
				label="Статус"
				options={[
					{ value: '', label: 'Все статусы' },
					...Object.values(MeetingRequestStatusEnum).map((value) => ({ value, label: STATUS_LABEL[value] }))
				]}
				value={status ?? ''}
				onChange={(event) => {
					const value = event.target.value;
					onStatusChange(value ? (value as MeetingRequestStatusEnum) : undefined);
				}}
				small
			/>
			<Select<Props['sort']>
				label="Сортировка"
				options={[
					{ value: 'createdAt:desc', label: 'Сначала новые заявки' },
					{ value: 'createdAt:asc', label: 'Сначала старые заявки' },
					{ value: 'meetingAt:asc', label: 'Ближайшие встречи' },
					{ value: 'meetingAt:desc', label: 'Дальние встречи' }
				]}
				value={sort}
				onChange={(event) => onSortChange(event.target.value as Props['sort'])}
				small
			/>
			<Checkbox
				checked={upcoming24hOnly}
				onChange={(event) => onUpcoming24hOnlyChange(event.target.checked)}
				label="Только встречи в 24 часа"
				description="Клиентский фильтр по времени встречи"
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
