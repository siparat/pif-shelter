import { JSX } from 'react';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { router } from './router';
import './styles/global.css';

export const App = (): JSX.Element => {
	return (
		<QueryProvider>
			<RouterProvider router={router} />
			<Toaster
				position="bottom-center"
				toastOptions={{
					duration: 7000,
					style: {
						maxWidth: '760px',
						background: 'rgba(32, 25, 21, 0.95)',
						color: 'var(--color-text-on-dark)',
						border: '1px solid rgba(255, 255, 255, 0.2)',
						fontSize: '13px',
						fontWeight: 600
					}
				}}
			/>
		</QueryProvider>
	);
};

export default App;
