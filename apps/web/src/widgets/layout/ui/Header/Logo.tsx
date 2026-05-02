import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../shared/config/routes';
import LogoDark from '../../../../shared/icons/logo-light.svg?react';

interface LogoProps {
	isHome?: boolean;
}

export const Logo = ({ isHome }: LogoProps): JSX.Element => {
	return (
		<Link
			to={ROUTES.home}
			className="max-[420px]:absolute max-[420px]:left-[50%] max-[420px]:-translate-x-[50%] min-w-0 shrink-0 flex items-center gap-2 md:gap-3">
			<LogoDark
				className={`shrink-0 max-[420px]:h-[48px] h-[40px] w-[45px] md:h-[65px] md:w-[50px] ${isHome ? 'text-(--color-bg-primary)' : 'text-(--color-text-primary)'}`}
			/>
			<div
				className={`max-[420px]:hidden min-w-0 leading-[1.05] ${isHome ? 'text-(--color-bg-primary)' : 'text-(--color-text-primary)'}`}>
				<p className="truncate text-[14px] sm:text-[15px] font-semibold">Приют для бездомных животных</p>
				<p className="text-[11px] font-semibold uppercase">ГОРОД ДОНЕЦК</p>
			</div>
		</Link>
	);
};
