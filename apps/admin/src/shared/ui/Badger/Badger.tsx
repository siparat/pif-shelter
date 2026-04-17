import { JSX, PropsWithChildren } from 'react';

export const Badger = ({ children, color }: PropsWithChildren<{ color: string }>): JSX.Element => {
	return (
		<span style={{ background: color }} className="rounded-full px-2 py-1 text-xs font-semibold">
			{children}
		</span>
	);
};
