import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, JSX } from 'react';
import { cn } from '../../lib';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
	isLoading?: boolean;
}

export const Button = ({ isLoading, disabled, className, children, ...props }: Props): JSX.Element => {
	return (
		<button
			{...props}
			disabled={disabled ?? isLoading}
			className={cn(
				'mt-2 w-full bg-(--color-brand-orange) hover:bg-(--color-brand-orange)-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-(--color-brand-orange)/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group',
				className
			)}>
			{isLoading && <Loader2 className="animate-spin" size={24} />} {children}
		</button>
	);
};
