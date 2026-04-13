import { createBrowserRouter, createRoutesFromChildren, Route } from 'react-router-dom';
import { Layout } from '../widgets/layout';
import { DashboardPage } from '../pages/dashboard';

export const router = createBrowserRouter(
	createRoutesFromChildren(
		<>
			<Route element={<Layout />}>
				<Route path="/" element={<DashboardPage />} />
			</Route>
		</>
	)
);
