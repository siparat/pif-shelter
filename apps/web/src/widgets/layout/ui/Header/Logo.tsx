import { JSX } from 'react';
import { Link } from 'react-router-dom';
import LogoDark from '../../../../shared/icons/logo-light.svg?react';
import { ROUTES } from '../../../../shared/config/routes';

export const Logo = (): JSX.Element => {
	return (
		<Link to={ROUTES.home} className="min-w-0 shrink-0 flex items-center gap-2 md:gap-3">
			<LogoDark className="shrink-0 h-[33px] w-[40px] md:h-[65px] md:w-[60px]" />
			<div className="min-w-0 leading-[1.05] text-(--color-text-primary)">
				<p className="truncate text-[10px] font-semibold sm:text-[13px] md:text-[18px]">
					Приют для бездомных животных
				</p>
				<p className="text-[9px] font-semibold uppercase max-[420px]:hidden sm:text-[10px] md:text-[12px]">
					ГОРОД ДОНЕЦК
				</p>
			</div>
		</Link>
	);
};
