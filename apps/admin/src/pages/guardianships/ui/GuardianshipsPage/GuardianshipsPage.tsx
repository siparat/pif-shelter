import { Loader2 } from 'lucide-react';
import { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useCanAccessAllGuardianships } from '../../../../entities/guardianship';
import { useSession } from '../../../../entities/session/model/hooks';
import { ROUTES } from '../../../../shared/config';

export const GuardianshipsPage = (): JSX.Element => {
	const { data: session, isLoading } = useSession();
	const canAccessAll = useCanAccessAllGuardianships();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (!session?.user) {
		return <Navigate to={ROUTES.login} replace />;
	}

	return <Navigate to={canAccessAll ? ROUTES.guardianshipsAll : ROUTES.guardianshipsMy} replace />;
};

export default GuardianshipsPage;
