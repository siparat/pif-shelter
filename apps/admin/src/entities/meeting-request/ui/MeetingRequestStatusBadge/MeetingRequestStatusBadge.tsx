import { MeetingRequestStatusEnum } from '@pif/shared';
import { HTMLAttributes, JSX } from 'react';
import { cn } from '../../../../shared/lib';

interface Props extends HTMLAttributes<HTMLSpanElement> {
	status: MeetingRequestStatusEnum;
}

const STATUS_COLOR: Record<MeetingRequestStatusEnum, string> = {
	[MeetingRequestStatusEnum.NEW]: 'bg-amber-500/15 text-amber-300',
	[MeetingRequestStatusEnum.CONFIRMED]: 'bg-emerald-500/15 text-emerald-300',
	[MeetingRequestStatusEnum.REJECTED]: 'bg-rose-500/15 text-rose-300'
};

const STATUS_LABEL: Record<MeetingRequestStatusEnum, string> = {
	[MeetingRequestStatusEnum.NEW]: 'Новая',
	[MeetingRequestStatusEnum.CONFIRMED]: 'Подтверждена',
	[MeetingRequestStatusEnum.REJECTED]: 'Отклонена'
};

export const MeetingRequestStatusBadge = ({ status, className, ...props }: Props): JSX.Element => {
	return (
		<span
			{...props}
			className={cn(className, STATUS_COLOR[status], 'rounded-full px-2 py-1 text-xs font-semibold')}>
			{STATUS_LABEL[status]}
		</span>
	);
};
