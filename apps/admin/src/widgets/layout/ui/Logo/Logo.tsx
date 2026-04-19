import { JSX } from 'react';
import ShortLogoIcon from './short-logo.svg?react';

export const Logo = (): JSX.Element => {
	return (
		<div>
			<div className="flex gap-x-2 items-start max-md:justify-center max-md:-translate-x-2">
				<ShortLogoIcon className="max-md:w-10 max-md:h-10" />
				<p className="font-['Golos_Text'] text-[38px] max-md:text-4xl">ПИФ</p>
			</div>
			<p className="text-(--color-text-secondary) text-sm max-md:text-xs">Панель управления приютом</p>
		</div>
	);
};
