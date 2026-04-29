import { JSX } from 'react';
import { cn } from '../../lib/cn';

interface YearSwitchProps {
	years: number[];
	activeYear: number;
	onChange: (year: number) => void;
	variant?: 'default' | 'glass';
}

export const YearSwitch = ({ years, activeYear, onChange, variant = 'default' }: YearSwitchProps): JSX.Element => (
	<div className="flex flex-wrap gap-2">
		{years.map((year) => {
			const isActive = activeYear === year;
			return (
				<button
					key={year}
					type="button"
					onClick={() => onChange(year)}
					className={cn(
						'h-9 rounded-full px-5 text-[14px] font-bold transition-colors',
						variant === 'glass'
							? isActive
								? 'bg-(--color-brand-accent) text-white shadow-lg shadow-[#fe8651]/30'
								: 'border border-white/10 bg-white/5 text-(--color-text-on-dark) backdrop-blur-md hover:bg-white/10'
							: isActive
								? 'bg-(--color-brand-accent) text-white'
								: 'bg-(--color-brand-brown) text-(--color-text-on-dark) hover:bg-(--color-brand-brown-strong)'
					)}>
					{year}
				</button>
			);
		})}
	</div>
);
