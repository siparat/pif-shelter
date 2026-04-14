import { JSX } from 'react';

export const Header = (): JSX.Element => {
	return (
		<header className="h-20 bg-(--color-bg-primary)/60 backdrop-blur-xl sticky top-0 border-b border-(--color-border) px-4 md:px-10 flex items-center justify-between z-50">
			<div className="md:hidden">Админ панель</div>
		</header>
	);
};
