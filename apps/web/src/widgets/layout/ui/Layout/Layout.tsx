import { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/Header';

export const Layout = (): JSX.Element => {
	return (
		<div className="min-h-screen bg-(--color-bg-soft) text-(--color-text-primary)">
			<Header />
			<main className="mx-auto w-full max-w-[1400px] px-6 py-8">
				<Outlet />
			</main>
		</div>
	);
};
