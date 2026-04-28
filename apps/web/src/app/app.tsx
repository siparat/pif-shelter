import { JSX } from 'react';
import './styles/global.css';

export const App = (): JSX.Element => {
	return <div className="min-h-screen bg-(--color-bg-primary) text-(--color-text-primary)"></div>;
};

export default App;
