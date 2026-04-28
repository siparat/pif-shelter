import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/app';
import { initializeSeo } from './app/seo';

const root = createRoot(document.getElementById('root') as HTMLElement);

initializeSeo();

root.render(
	<StrictMode>
		<App />
	</StrictMode>
);
