import { Loader2 } from 'lucide-react';
import { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../../entities/session/model/hooks';

interface ProtectedRouteProps {
	children: ReactNode;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
	const { data: session, isLoading, isError } = useSession();
	const location = useLocation();

	if (isLoading) {
		return (
			<div className="min-h-screen w-full flex items-center justify-center bg-(--color-bg-primary)">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={48} />
			</div>
		);
	}

	if (isError || !session) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <>{children}</>;
};
