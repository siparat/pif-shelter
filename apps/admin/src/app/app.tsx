import { JSX } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { QueryProvider } from './providers/QueryProvider';
import { Toaster } from 'react-hot-toast';
import { PwaUpdater } from './providers/PwaUpdater';
import './styles/global.css';

export const App = (): JSX.Element => {
	return (
		<QueryProvider>
			<PwaUpdater />
			<RouterProvider router={router} />
			<Toaster
				position="top-right"
				toastOptions={{
					style: {
						background: 'var(--color-bg-secondary)',
						color: 'var(--color-text-primary)',
						border: '1px solid var(--color-border)'
					}
				}}
			/>
		</QueryProvider>
	);
};

export default App;
