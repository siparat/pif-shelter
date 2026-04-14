import { JSX } from 'react';
import { LoginForm } from '../../../../features/auth/login/ui/LoginForm/LoginForm';

export const LoginPage = (): JSX.Element => {
	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-(--color-bg-primary) p-4">
			<LoginForm />
		</div>
	);
};

export default LoginPage;
