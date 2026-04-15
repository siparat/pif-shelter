import { JSX, lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../widgets/layout';
import { ProtectedRoute } from './providers/ProtectedRoute';
import { adminRoutes } from '../shared/config';
import { Loader2 } from 'lucide-react';

const LoginPage = lazy(() => import('../pages/login/ui/LoginPage/LoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/ui/DashboardPage/DashboardPage'));
const AnimalsPage = lazy(() => import('../pages/animals/ui/AnimalsPage/AnimalsPage'));
const GuardianshipsPage = lazy(() => import('../pages/guardianships/ui/GuardianshipsPage/GuardianshipsPage'));
const MeetingsPage = lazy(() => import('../pages/meetings/ui/MeetingsPage/MeetingsPage'));

const PageFallback = (): JSX.Element => (
	<div className="min-h-60 w-full flex items-center justify-center">
		<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
	</div>
);

const routeComponentByPath: Record<string, JSX.Element> = {
	'/': <DashboardPage />,
	'/animals': <AnimalsPage />,
	'/guardianships': <GuardianshipsPage />,
	'/meetings': <MeetingsPage />
};

export const router = createBrowserRouter([
	{
		path: '/login',
		element: (
			<Suspense fallback={<PageFallback />}>
				<LoginPage />
			</Suspense>
		)
	},
	{
		element: (
			<ProtectedRoute>
				<Layout />
			</ProtectedRoute>
		),
		children: adminRoutes.map(({ path }) => ({
			path,
			element: <Suspense fallback={<PageFallback />}>{routeComponentByPath[path]}</Suspense>
		}))
	}
]);
