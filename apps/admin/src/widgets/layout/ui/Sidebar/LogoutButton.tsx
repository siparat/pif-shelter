import { LogOut } from 'lucide-react';
import { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthState } from '../../../../shared/lib';

export const LogoutButton = (): JSX.Element => {
	const navigate = useNavigate();

	const onLogout = (): void => {
		clearAuthState();
		navigate('/login', { replace: true });
	};

	return (
		<button
			onClick={onLogout}
			className="flex cursor-pointer items-center gap-3 px-4 py-3.5 w-full rounded-xl text-red-400 hover:bg-red-400/10 font-bold transition-colors group">
			<LogOut size={20} />
			Выйти
		</button>
	);
};
