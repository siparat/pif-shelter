import { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';

export const Layout = (): JSX.Element => {
	return (
		<div className="flex bg-brand-beige min-h-screen selection:bg-brand-orange/10 selection:text-brand-orange">
			<Sidebar />

			<div className="flex-1 flex flex-col">
				<Header />

				<main className="p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
					<Outlet />
				</main>
			</div>
		</div>
	);
};
