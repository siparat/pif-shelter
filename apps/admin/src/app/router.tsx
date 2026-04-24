import { Loader2 } from 'lucide-react';
import { JSX, lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { adminRoutes, ROUTES } from '../shared/config';
import { Layout } from '../widgets/layout';
import { ProtectedRoute } from './providers/ProtectedRoute';

const LoginPage = lazy(() => import('../pages/login/ui/LoginPage/LoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/ui/DashboardPage/DashboardPage'));
const AnimalsPage = lazy(() => import('../pages/animals/ui/AnimalsPage/AnimalsPage'));
const AnimalPage = lazy(() => import('../pages/animal/ui/AnimalPage/AnimalPage'));
const AnimalEditPage = lazy(() => import('../pages/animal-edit/ui/AnimalEditPage/AnimalEditPage'));
const PostCreatePage = lazy(() => import('../pages/post-create/ui/PostCreatePage/PostCreatePage'));
const PostDetailPage = lazy(() => import('../pages/post-detail/ui/PostDetailPage/PostDetailPage'));
const PostEditPage = lazy(() => import('../pages/post-edit/ui/PostEditPage/PostEditPage'));
const GuardianshipsPage = lazy(() => import('../pages/guardianships/ui/GuardianshipsPage/GuardianshipsPage'));
const MyGuardianshipsPage = lazy(() => import('../pages/guardianships/ui/MyGuardianshipsPage/MyGuardianshipsPage'));
const AllGuardianshipsPage = lazy(() => import('../pages/guardianships/ui/AllGuardianshipsPage/AllGuardianshipsPage'));
const GuardianPage = lazy(() => import('../pages/guardian/ui/GuardianPage/GuardianPage'));
const UserPage = lazy(() => import('../pages/user/ui/UserPage/UserPage'));
const MeetingsPage = lazy(() => import('../pages/meetings/ui/MeetingsPage/MeetingsPage'));
const MeetingPage = lazy(() => import('../pages/meeting/ui/MeetingPage/MeetingPage'));
const WishlistPage = lazy(() => import('../pages/wishlist/ui/WishlistPage/WishlistPage'));
const CampaignsPage = lazy(() => import('../pages/campaigns/ui/CampaignsPage/CampaignsPage'));

const PageFallback = (): JSX.Element => (
	<div className="min-h-60 w-full flex items-center justify-center">
		<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
	</div>
);

const routeComponentByPath: Record<string, JSX.Element> = {
	[ROUTES.dashboard]: <DashboardPage />,
	[ROUTES.animals]: <AnimalsPage />,
	[ROUTES.animalDetails]: <AnimalPage />,
	[ROUTES.animalEdit]: <AnimalEditPage />,
	[ROUTES.postCreate]: <PostCreatePage />,
	[ROUTES.postDetails]: <PostDetailPage />,
	[ROUTES.postEdit]: <PostEditPage />,
	[ROUTES.guardianships]: <GuardianshipsPage />,
	[ROUTES.guardianshipsMy]: <MyGuardianshipsPage />,
	[ROUTES.guardianshipsAll]: <AllGuardianshipsPage />,
	[ROUTES.guardian]: <GuardianPage />,
	[ROUTES.user]: <UserPage />,
	[ROUTES.meetings]: <MeetingsPage />,
	[ROUTES.meetingDetails]: <MeetingPage />,
	[ROUTES.wishlist]: <WishlistPage />,
	[ROUTES.campaigns]: <CampaignsPage />
};

export const router = createBrowserRouter([
	{
		path: ROUTES.login,
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
