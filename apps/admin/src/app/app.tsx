import { JSX } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './styles/global.css';

export const App = (): JSX.Element => {
	return <RouterProvider router={router} />;
};

export default App;
