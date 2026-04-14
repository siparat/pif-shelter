import { LayoutDashboard, MessageSquare, PawPrint, Users } from 'lucide-react';
import { JSX } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';

export const Layout = (): JSX.Element => {
	const location = useLocation();

	return (
		<div className="flex bg-(--color-bg-primary) text-(--color-text-primary) min-h-screen selection:bg-(--color-brand-orange)/10 selection:text-(--color-brand-orange)">
			<Sidebar />

			<div className="flex-1 flex flex-col pb-20 md:pb-0">
				<Header />

				<main className="p-4 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
					<Outlet />
				</main>
			</div>

			<nav className="fixed bottom-0 left-0 right-0 h-20 bg-(--color-bg-secondary)/80 backdrop-blur-xl border-t border-(--color-border) flex items-center justify-around md:hidden z-50">
				<Link
					to="/"
					className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-(--color-brand-orange)' : 'text-(--color-text-secondary)'}`}>
					<LayoutDashboard size={24} />
					<span className="text-[10px] font-bold uppercase">Обзор</span>
				</Link>
				<Link
					to="/animals"
					className={`flex flex-col items-center gap-1 ${location.pathname.startsWith('/animals') ? 'text-(--color-brand-orange)' : 'text-(--color-text-secondary)'}`}>
					<PawPrint size={24} />
					<span className="text-[10px] font-bold uppercase">Питомцы</span>
				</Link>
				<Link
					to="/guardianship"
					className={`flex flex-col items-center gap-1 ${location.pathname.startsWith('/guardianship') ? 'text-(--color-brand-orange)' : 'text-(--color-text-secondary)'}`}>
					<Users size={24} />
					<span className="text-[10px] font-bold uppercase">Опека</span>
				</Link>
				<Link
					to="/meeting-requests"
					className={`flex flex-col items-center gap-1 ${location.pathname.startsWith('/meeting-requests') ? 'text-(--color-brand-orange)' : 'text-(--color-text-secondary)'}`}>
					<MessageSquare size={24} />
					<span className="text-[10px] font-bold uppercase">Встречи</span>
				</Link>
			</nav>
		</div>
	);
};
