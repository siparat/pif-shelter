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
const ContactsPage = lazy(() => import('../pages/contacts/ui/ContactsPage/ContactsPage'));
const HelpPage = lazy(() => import('../pages/help/ui/HelpPage/HelpPage'));

const PageFallback = (): JSX.Element => <div className="min-h-40 w-full" />;

const routeComponentByPath: Record<string, JSX.Element> = {
	[ROUTES.home]: <HomePage />,
	[ROUTES.about]: <AboutPage />,
	[ROUTES.animals]: <AnimalsPage />,
	[ROUTES.animalDetails]: <AnimalPage />,
	[ROUTES.donations]: <DonationsPage />,
	[ROUTES.donationsList]: <DonationsListPage />,
	[ROUTES.contacts]: <ContactsPage />,
	[ROUTES.help]: <HelpPage />
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
