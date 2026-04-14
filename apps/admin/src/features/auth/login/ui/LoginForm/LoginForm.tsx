import { zodResolver } from '@hookform/resolvers/zod';
import { HTTPError } from 'ky';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { signInEmail } from '../../api/sign-in-email';
import { LoginFormValues, loginSchema } from '../../model/login.schema';

export const LoginForm: FC = () => {
	const [showPassword, setShowPassword] = useState(false);
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
		} catch (err: any) {
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
				<div className="flex flex-col gap-2">
					<label className="text-sm font-semibold text-(--color-text-primary) px-1">Почта</label>
					<div className="relative group">
						<Mail
							className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
								errors.email
									? 'text-red-400'
									: 'text-(--color-text-secondary) group-focus-within:text-(--color-brand-orange)'
							}`}
							size={18}
						/>
						<input
							{...register('email')}
							type="email"
							className={`w-full bg-(--color-bg-primary) border rounded-xl py-3 pl-12 pr-4 text-(--color-text-primary) focus:outline-none transition-all ${
								errors.email
									? 'border-red-400'
									: 'border-(--color-border) focus:border-(--color-brand-orange)'
							}`}
							placeholder="admin@pif-dpr.ru"
						/>
					</div>
					{errors.email && (
						<span className="text-xs text-red-400 px-1 font-medium">{errors.email.message}</span>
					)}
				</div>

				<div className="flex flex-col gap-2">
					<label className="text-sm font-semibold text-(--color-text-primary) px-1">Пароль</label>
					<div className="relative group">
						<Lock
							className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
								errors.password
									? 'text-red-400'
									: 'text-(--color-text-secondary) group-focus-within:text-(--color-brand-orange)'
							}`}
							size={18}
						/>
						<input
							{...register('password')}
							type={showPassword ? 'text' : 'password'}
							className={`w-full bg-(--color-bg-primary) border rounded-xl py-3 pl-12 pr-12 text-(--color-text-primary) focus:outline-none transition-all ${
								errors.password
									? 'border-red-400'
									: 'border-(--color-border) focus:border-(--color-brand-orange)'
							}`}
							placeholder="••••••••"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-4 top-1/2 -translate-y-1/2 text-(--color-text-secondary) hover:text-(--color-brand-orange) transition-colors">
							{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
						</button>
					</div>
					{errors.password && (
						<span className="text-xs text-red-400 px-1 font-medium">{errors.password.message}</span>
					)}
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					className="mt-2 w-full bg-(--color-brand-orange) hover:bg-(--color-brand-orange)-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-(--color-brand-orange)/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group">
					{isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Войти в панель'}
				</button>
			</form>
		</div>
	);
};
