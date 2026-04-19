import { JSX } from 'react';
import { Logo } from '../Logo/Logo';

export const Header = (): JSX.Element => {
	return (
		<header className="bg-(--color-bg-primary)/60 backdrop-blur-xl sticky top-0 border-b border-(--color-border) px-4 py-2 md:px-10 flex items-center justify-center z-50 md:hidden">
			<Logo />
		</header>
	);
};
