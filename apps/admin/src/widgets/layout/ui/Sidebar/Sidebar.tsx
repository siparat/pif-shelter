import { LogOut } from 'lucide-react';
import { JSX } from 'react';

export const Sidebar = (): JSX.Element => {
	return (
		<aside className="w-72 h-screen flex flex-col bg-white border-r border-[#e6e0da] sticky top-0">
			<div className="flex-1 p-6 flex flex-col gap-1 mt-4">
				<p className="text-[10px] font-bold text-brand-brown-light uppercase tracking-[0.2em] px-4 mb-4 opacity-50">
					Меню управления
				</p>
			</div>

			<div className="p-6 border-t border-[#e6e0da]">
				<button className="flex cursor-pointer items-center gap-3 px-4 py-3.5 w-full rounded-xl text-red-500 hover:bg-red-50 font-bold transition-colors group">
					<LogOut size={20} />
					Выйти
				</button>
			</div>
		</aside>
	);
};
