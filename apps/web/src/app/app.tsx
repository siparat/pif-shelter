import { JSX } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { router } from './router';
import './styles/global.css';

export const App = (): JSX.Element => {
	return (
		<QueryProvider>
			<RouterProvider router={router} />
		</QueryProvider>
	);
};

export default App;
