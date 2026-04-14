import { JSX } from 'react';
import ShortLogoIcon from './short-logo.svg?react';

export const SidebarLogo = (): JSX.Element => {
	return (
		<div>
			<div className="flex gap-x-2 items-start">
				<ShortLogoIcon />
				<p className="font-['Golos_Text'] font-bold text-[38px]">ПИФ</p>
			</div>
			<p className="text-(--color-text-secondary) text-sm">Панель управления приютом</p>
		</div>
	);
};
