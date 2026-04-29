import { PawPrint } from 'lucide-react';
import { JSX, lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '../shared/config/routes';
import { Layout } from '../widgets/layout';

const HomePage = lazy(() => import('../pages/home/ui/HomePage/HomePage'));
const AboutPage = lazy(() => import('../pages/about/ui/AboutPage/AboutPage'));
const AnimalsPage = lazy(() => import('../pages/animals/ui/AnimalsPage/AnimalsPage'));
const AnimalPage = lazy(() => import('../pages/animal/ui/AnimalPage/AnimalPage'));
const DonationsPage = lazy(() => import('../pages/donations/ui/DonationsPage/DonationsPage'));
const DonationsListPage = lazy(() => import('../pages/donations-list/ui/DonationsListPage/DonationsListPage'));
const CancelSubscriptionPage = lazy(
	() => import('../pages/cancel-subscription/ui/CancelSubscriptionPage/CancelSubscriptionPage')
);
const ContactsPage = lazy(() => import('../pages/contacts/ui/ContactsPage/ContactsPage'));
const HelpPage = lazy(() => import('../pages/help/ui/HelpPage/HelpPage'));
const CampaignsPage = lazy(() => import('../pages/campaigns/ui/CampaignsPage/CampaignsPage'));

const PageFallback = (): JSX.Element => (
	<div className="flex min-h-[60vh] items-center justify-center">
		<div className="flex flex-col items-center gap-5">
			<div className="relative flex h-16 w-16 items-center justify-center">
				<div className="absolute h-16 w-16 rounded-full bg-[#fe8651] opacity-20 animate-ping" />
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fe8651]">
					<PawPrint size={28} className="text-white" />
				</div>
			</div>
			<div className="flex gap-1.5">
				<span className="block h-2 w-2 rounded-full bg-[#fe8651] animate-bounce [animation-delay:0ms]" />
				<span className="block h-2 w-2 rounded-full bg-[#fe8651] animate-bounce [animation-delay:150ms]" />
				<span className="block h-2 w-2 rounded-full bg-[#fe8651] animate-bounce [animation-delay:300ms]" />
			</div>
		</div>
	</div>
);

const routeComponentByPath: Record<string, JSX.Element> = {
	[ROUTES.home]: <HomePage />,
	[ROUTES.about]: <AboutPage />,
	[ROUTES.animals]: <AnimalsPage />,
	[ROUTES.animalDetails]: <AnimalPage />,
	[ROUTES.donations]: <DonationsPage />,
	[ROUTES.donationsList]: <DonationsListPage />,
	[ROUTES.cancelSubscription]: <CancelSubscriptionPage />,
	[ROUTES.contacts]: <ContactsPage />,
	[ROUTES.help]: <HelpPage />,
	[ROUTES.campaigns]: <CampaignsPage />
};

export const router = createBrowserRouter([
	{
		element: <Layout />,
		children: Object.values(ROUTES).map((path) => ({
			path,
			element: <Suspense fallback={<PageFallback />}>{routeComponentByPath[path]}</Suspense>
		}))
	}
]);
