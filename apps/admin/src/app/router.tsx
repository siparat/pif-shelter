import { createBrowserRouter, createRoutesFromChildren, Route } from 'react-router-dom';
import { DashboardPage } from '../pages/dashboard';
import { LoginPage } from '../pages/login/ui/LoginPage/LoginPage';
import { Layout } from '../widgets/layout';
import { ProtectedRoute } from './providers/ProtectedRoute';

export const router = createBrowserRouter(
	createRoutesFromChildren(
		<>
			<Route path="/login" element={<LoginPage />} />
			<Route
				element={
					<ProtectedRoute>
						<Layout />
					</ProtectedRoute>
				}>
				<Route path="/" element={<DashboardPage />} />
			</Route>
		</>
	)
);
