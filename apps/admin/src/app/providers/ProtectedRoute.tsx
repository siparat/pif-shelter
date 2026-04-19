import { Loader2 } from 'lucide-react';
import { JSX, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '../../shared/ui';
import { useSession } from '../../entities/session/model/hooks';

interface ProtectedRouteProps {
	children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
	const { data: session, isLoading, isError, refetch } = useSession();
	const location = useLocation();

	if (isLoading) {
		return (
			<div className="min-h-screen w-full flex items-center justify-center bg-(--color-bg-primary)">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={48} />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen w-full flex items-center justify-center bg-(--color-bg-primary) p-4">
				<div className="max-w-md w-full border border-red-400/20 bg-red-400/10 text-red-300 rounded-2xl p-6 text-center">
					<p className="font-bold mb-2">Не удалось проверить сессию</p>
					<p className="text-sm opacity-80 mb-4">Проверьте соединение и попробуйте снова</p>
					<Button className="w-full mt-0" onClick={() => void refetch()}>
						Повторить
					</Button>
				</div>
			</div>
		);
	}

	if (!session) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <>{children}</>;
};
