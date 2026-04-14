import { zodResolver } from '@hookform/resolvers/zod';
import { HTTPError } from 'ky';
import { Lock, Mail } from 'lucide-react';
import { JSX } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../../../../../shared/ui';
import { signInEmail } from '../../api/sign-in-email';
import { LoginFormValues, loginSchema } from '../../model/login.schema';

export const LoginForm = (): JSX.Element => {
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema)
	});

	const onSubmit = async (values: LoginFormValues): Promise<void> => {
		try {
			const data = await signInEmail(values);

			if (data.token) {
				localStorage.setItem('token', data.token);
			}

			toast.success('Успешный вход');
			navigate('/');
		} catch (err) {
			let message = 'Не удалось войти. Попробуйте снова.';
			if (err instanceof HTTPError) {
				try {
					message = err.data.message;
				} catch (e) {
					console.error(e);
				}
			}
			toast.error(message);
		}
	};

	return (
		<div className="w-full max-w-md p-8 bg-(--color-bg-secondary) rounded-2xl border border-(--color-border) shadow-pif-lg">
			<div className="flex flex-col gap-2 mb-8">
				<h1 className="text-3xl font-bold text-(--color-text-primary)">Вход</h1>
				<p className="text-(--color-text-secondary)">Добро пожаловать в систему управления приютом</p>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
				<Input
					{...register('email')}
					Icon={Mail}
					error={errors.email?.message}
					label="Почта"
					type="text"
					placeholder="admin@pif-dpr.ru"
				/>

				<Input
					{...register('password')}
					Icon={Lock}
					error={errors.password?.message}
					label="Пароль"
					type="password"
					placeholder="09.03.01"
				/>

				<Button type="submit" isLoading={isSubmitting}>
					Войти в панель
				</Button>
			</form>
		</div>
	);
};
