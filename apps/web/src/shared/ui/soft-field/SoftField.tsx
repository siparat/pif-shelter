import { JSX, ReactNode } from 'react';

export type SoftFieldProps = {
	id: string;
	label: string;
	error?: string | null;
	children: ReactNode;
};

export const SoftField = ({ id, label, error, children }: SoftFieldProps): JSX.Element => {
	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={id} className="text-xs font-bold text-(--color-text-secondary)">
				{label}
			</label>
			{children}
			{error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}
		</div>
	);
};
