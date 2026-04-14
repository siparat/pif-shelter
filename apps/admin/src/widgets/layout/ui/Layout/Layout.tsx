import { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '../BottomNav/BottomNav';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';

export const Layout = (): JSX.Element => {
	return (
		<div className="flex bg-(--color-bg-primary) text-(--color-text-primary) min-h-screen selection:bg-(--color-brand-orange)/10 selection:text-(--color-brand-orange)">
			<Sidebar />

			<div className="flex-1 flex flex-col pb-20 md:pb-0">
				<Header />

				<main className="p-4 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
					<Outlet />
				</main>
			</div>

			<BottomNav />
		</div>
	);
};
