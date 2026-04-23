import { GuardianshipStatusEnum, GuardianshipStatusNames } from '@pif/shared';
import { HTMLAttributes, JSX } from 'react';
import { cn } from '../../../../shared/lib';

interface Props extends HTMLAttributes<HTMLSpanElement> {
	status: GuardianshipStatusEnum;
}

const STATUS_COLOR: Record<GuardianshipStatusEnum, string> = {
	[GuardianshipStatusEnum.ACTIVE]: 'bg-emerald-500/15 text-emerald-300',
	[GuardianshipStatusEnum.CANCELLED]: 'bg-rose-500/15 text-rose-300',
	[GuardianshipStatusEnum.PENDING_PAYMENT]: 'bg-amber-500/15 text-amber-300'
};

export const GuardianshipStatusBadge = ({ status, className, ...props }: Props): JSX.Element => {
	return (
		<span
			{...props}
			className={cn(className, STATUS_COLOR[status], 'rounded-full px-2 py-1 text-xs font-semibold')}>
			{GuardianshipStatusNames[status]}
		</span>
	);
};
