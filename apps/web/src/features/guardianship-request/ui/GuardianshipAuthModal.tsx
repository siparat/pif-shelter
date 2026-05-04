import { LogIn, X } from 'lucide-react';
import { JSX, useEffect, useRef } from 'react';
import { cn } from '../../../shared/lib/cn';
import type { useGuardianshipRequest } from '../model/use-guardianship-request';

type GuardianshipAuthModalProps = {
	open: boolean;
	onClose: () => void;
	animalName: string;
	authForm: ReturnType<typeof useGuardianshipRequest>['authForm'];
	authMutation: ReturnType<typeof useGuardianshipRequest>['authMutation'];
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export const GuardianshipAuthModal = ({
	open,
	onClose,
	animalName,
	authForm,
	authMutation,
	onSubmit
}: GuardianshipAuthModalProps): JSX.Element => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const node = dialogRef.current;
		if (!node) return;
		if (open) {
			if (!node.open) node.showModal();
			requestAnimationFrame(() => {
				closeButtonRef.current?.focus();
			});
		} else if (node.open) {
			node.close();
		}
	}, [open]);

	const {
		register,
		formState: { errors }
	} = authForm;

	const labelClass = 'block text-sm font-semibold text-(--color-text-primary) mb-1.5';
	const inputClass =
		'w-full rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) px-4 py-2.5 text-(--color-text-primary) outline-none focus:ring-2 focus:ring-(--color-brand-accent)/40';
	const errorClass = 'text-xs text-red-500 mt-1';

	return (
		<dialog
			ref={dialogRef}
			className={cn(
				'fixed inset-0 z-210 m-auto w-[calc(100vw-1.5rem)] max-w-sm overflow-visible rounded-4xl border-0 bg-transparent p-0 shadow-none sm:w-full',
				'backdrop:bg-[rgba(79,61,56,0.60)] backdrop:backdrop-blur-sm'
			)}
			aria-labelledby="guardianship-auth-title"
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
			onClick={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}>
			<div
				className="relative flex flex-col overflow-hidden rounded-4xl border border-(--color-border-soft) bg-(--color-surface-primary) shadow-[0_28px_72px_rgba(79,61,56,0.28)]"
				onClick={(event) => event.stopPropagation()}>
				<div
					className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-(--color-brand-accent)/20 blur-3xl"
					aria-hidden
				/>

				<div className="relative flex items-start justify-between gap-3 border-b border-(--color-border-soft) bg-(--color-surface-primary) px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
					<div className="flex min-w-0 flex-col gap-1">
						<span className="eyebrow inline-flex w-fit items-center gap-1.5 text-(--color-brand-accent)">
							<LogIn className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
							Вход в аккаунт
						</span>
						<h2
							id="guardianship-auth-title"
							className="text-xl font-bold tracking-tight text-(--color-text-primary) sm:text-2xl">
							Стать опекуном {animalName}
						</h2>
					</div>
					<button
						ref={closeButtonRef}
						type="button"
						onClick={onClose}
						className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--color-border-soft) bg-(--color-surface-secondary) text-(--color-text-primary) transition-colors hover:bg-(--color-brand-brown-soft)"
						aria-label="Закрыть">
						<X className="h-5 w-5" strokeWidth={2.2} aria-hidden />
					</button>
				</div>

				<div className="relative px-5 py-5 sm:px-6">
					<form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
						<p className="text-sm leading-relaxed text-(--color-text-secondary)">
							Введите данные своего аккаунта из ранее отправленного письма, чтобы оформить опекунство.
						</p>

						<div>
							<label htmlFor="ga-email" className={labelClass}>
								Email
							</label>
							<input
								id="ga-email"
								type="email"
								autoComplete="email"
								className={inputClass}
								{...register('email')}
							/>
							{errors.email && <p className={errorClass}>{errors.email.message}</p>}
						</div>

						<div>
							<label htmlFor="ga-password" className={labelClass}>
								Пароль
							</label>
							<input
								id="ga-password"
								type="password"
								autoComplete="current-password"
								className={inputClass}
								{...register('password')}
							/>
							{errors.password && <p className={errorClass}>{errors.password.message}</p>}
						</div>

						{authMutation.isError && (
							<p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
								{authMutation.error?.message || 'Ошибка входа. Проверьте email и пароль.'}
							</p>
						)}

						<button
							type="submit"
							disabled={authMutation.isPending}
							className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-(--color-brand-accent) font-bold text-white transition-[transform,filter] hover:brightness-105 active:scale-[0.98] disabled:opacity-60">
							<LogIn className="h-5 w-5" aria-hidden />
							{authMutation.isPending ? 'Вход…' : 'Войти и оформить'}
						</button>
					</form>
				</div>
			</div>
		</dialog>
	);
};
