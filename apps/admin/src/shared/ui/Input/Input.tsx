import { Eye, EyeOff, LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent, InputHTMLAttributes, JSX, useId, useState } from 'react';
import { cn } from '../../lib';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	classNameBlock?: string;
	Icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'>>;
}

export const Input = ({ className, classNameBlock, Icon, type, error, label, ...props }: Props): JSX.Element => {
	const id = useId();
	const [showPassword, setShowPassword] = useState<boolean>(false);

	return (
		<div className={cn('flex flex-col gap-2', classNameBlock)}>
			{label && (
				<label htmlFor={id} className="text-sm font-semibold text-(--color-text-primary) px-1">
					{label}
				</label>
			)}
			<div className="relative group">
				{Icon && (
					<label htmlFor={id}>
						<Icon
							className={cn(
								'absolute left-4 top-1/2 -translate-y-1/2 transition-colors',
								error
									? 'text-red-400'
									: 'text-(--color-text-secondary) group-focus-within:text-(--color-brand-orange)'
							)}
							size={18}
						/>
					</label>
				)}
				<input
					{...props}
					id={id}
					type={type == 'password' ? (showPassword ? 'text' : 'password') : type}
					className={cn(
						'w-full bg-(--color-bg-primary) border rounded-xl py-3 px-4 text-(--color-text-primary) focus:outline-none transition-all',
						error ? 'border-red-400' : 'border-(--color-border) focus:border-(--color-brand-orange)',
						Icon && 'pl-12',
						className
					)}
				/>
				{type == 'password' && (
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute right-4 top-1/2 -translate-y-1/2 text-(--color-text-secondary) hover:text-(--color-brand-orange) transition-colors">
						{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>
				)}
			</div>
			{error && <span className="text-xs text-red-400 px-1 font-medium">{error}</span>}
		</div>
	);
};
