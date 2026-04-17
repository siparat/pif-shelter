import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, JSX } from 'react';
import { cn } from '../../lib';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
	isLoading?: boolean;
	appearance?: 'primary' | 'red';
}

export const Button = ({
	isLoading,
	appearance = 'primary',
	disabled,
	className,
	children,
	...props
}: Props): JSX.Element => {
	const appearanceClasses: Record<NonNullable<Props['appearance']>, string> = {
		primary:
			'bg-(--color-brand-orange) hover:bg-(--color-brand-orange)-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-(--color-brand-orange)/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group',
		red: 'bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group'
	};

	return (
		<button {...props} disabled={disabled ?? isLoading} className={cn(appearanceClasses[appearance], className)}>
			{isLoading && <Loader2 className="animate-spin" size={24} />} {children}
		</button>
	);
};
