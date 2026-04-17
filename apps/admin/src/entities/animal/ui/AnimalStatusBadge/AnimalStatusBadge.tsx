import { AnimalStatusEnum, AnimalStatusNames } from '@pif/shared';
import { HTMLAttributes, JSX } from 'react';
import { cn } from '../../../../shared/lib';
import { statusBadgeColor } from '../../model/status-badge.color';

interface Props extends HTMLAttributes<HTMLSpanElement> {
	status: AnimalStatusEnum;
}

export const AnimalStatusBadge = ({ status, className, ...props }: Props): JSX.Element => {
	return (
		<span
			{...props}
			className={cn(className, statusBadgeColor(status), 'rounded-full px-2 py-1 text-xs font-semibold')}>
			{AnimalStatusNames[status]}
		</span>
	);
};
